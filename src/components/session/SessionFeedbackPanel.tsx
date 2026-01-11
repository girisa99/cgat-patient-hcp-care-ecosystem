/**
 * SessionFeedbackPanel - Two-way communication interface for session collaboration
 * Allows hosts and participants to exchange feedback with real-time status updates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Bell,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Video,
  Mic,
  User
} from 'lucide-react';
import { 
  useSessionFeedback, 
  SessionFeedback,
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  ReviewStatus,
  FEEDBACK_STATUS_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  FEEDBACK_CATEGORY_OPTIONS,
} from '@/hooks/useSessionFeedback';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionFeedbackPanelProps {
  sessionId: string;
  isHost?: boolean;
  participantToken?: string;
  participantName?: string;
  className?: string;
}

export const SessionFeedbackPanel: React.FC<SessionFeedbackPanelProps> = ({
  sessionId,
  isHost = false,
  participantToken,
  participantName,
  className,
}) => {
  const {
    feedback,
    reviewStatus,
    isLoading,
    isSubmitting,
    fetchFeedback,
    submitFeedback,
    respondToFeedback,
    updateFeedbackStatus,
    updateReviewStatus,
    subscribeToFeedback,
  } = useSessionFeedback();

  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'general' as FeedbackType,
    category: 'general' as FeedbackCategory,
    subject: '',
    content: '',
    suggestedValue: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());

  // Fetch and subscribe on mount
  useEffect(() => {
    if (sessionId) {
      fetchFeedback(sessionId);
      const unsubscribe = subscribeToFeedback(sessionId);
      return () => unsubscribe();
    }
  }, [sessionId, fetchFeedback, subscribeToFeedback]);

  const handleSubmitFeedback = async () => {
    const success = await submitFeedback({
      sessionId,
      participantToken,
      feedbackType: newFeedback.type,
      category: newFeedback.category,
      subject: newFeedback.subject,
      content: newFeedback.content,
      suggestedValue: newFeedback.suggestedValue || undefined,
      priority: newFeedback.priority,
    });

    if (success) {
      setIsNewFeedbackOpen(false);
      setNewFeedback({
        type: 'general',
        category: 'general',
        subject: '',
        content: '',
        suggestedValue: '',
        priority: 'normal',
      });
    }
  };

  const handleReply = async (feedbackId: string) => {
    const content = replyContent[feedbackId];
    if (!content?.trim()) return;

    const success = await respondToFeedback(feedbackId, content);
    if (success) {
      setReplyContent(prev => ({ ...prev, [feedbackId]: '' }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedFeedback(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    const option = FEEDBACK_STATUS_OPTIONS.find(o => o.value === status);
    return (
      <Badge className={cn('text-xs', option?.color || 'bg-gray-100')}>
        {option?.label || status}
      </Badge>
    );
  };

  const getReviewStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_review': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'changes_requested': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const pendingCount = feedback.filter(f => f.status === 'pending').length;
  const unreadCount = isHost 
    ? feedback.filter(f => !f.read_by_host && !f.is_from_host).length
    : feedback.filter(f => !f.read_by_participant && f.is_from_host).length;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Session Collaboration</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchFeedback(sessionId)}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            <Dialog open={isNewFeedbackOpen} onOpenChange={setIsNewFeedbackOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  {isHost ? 'Send Message' : 'Submit Feedback'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isHost ? 'Send Message to Participants' : 'Submit Feedback'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newFeedback.type}
                        onValueChange={(v) => setNewFeedback(p => ({ ...p, type: v as FeedbackType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEEDBACK_TYPE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.icon} {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newFeedback.category}
                        onValueChange={(v) => setNewFeedback(p => ({ ...p, category: v as FeedbackCategory }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEEDBACK_CATEGORY_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject (optional)</Label>
                    <Input
                      placeholder="Brief summary..."
                      value={newFeedback.subject}
                      onChange={(e) => setNewFeedback(p => ({ ...p, subject: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Your feedback or suggestion..."
                      rows={4}
                      value={newFeedback.content}
                      onChange={(e) => setNewFeedback(p => ({ ...p, content: e.target.value }))}
                    />
                  </div>

                  {!isHost && (
                    <div className="space-y-2">
                      <Label>Suggested Change (optional)</Label>
                      <Textarea
                        placeholder="If you have a specific suggestion, enter it here..."
                        rows={2}
                        value={newFeedback.suggestedValue}
                        onChange={(e) => setNewFeedback(p => ({ ...p, suggestedValue: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newFeedback.priority}
                      onValueChange={(v) => setNewFeedback(p => ({ ...p, priority: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsNewFeedbackOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitFeedback} disabled={isSubmitting || !newFeedback.content.trim()}>
                      {isSubmitting ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="feedback" className="flex-1 flex flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="feedback" className="flex-1 gap-1">
            <MessageSquare className="h-4 w-4" />
            Feedback
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="status" className="flex-1 gap-1">
            <CheckCircle className="h-4 w-4" />
            Review Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="flex-1 m-0">
          <ScrollArea className="h-[400px]">
            <CardContent className="space-y-4 pt-4">
              {feedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No feedback yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                feedback.map((item) => (
                  <FeedbackItem
                    key={item.id}
                    item={item}
                    isHost={isHost}
                    isExpanded={expandedFeedback.has(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                    onStatusChange={(status) => updateFeedbackStatus(item.id, status)}
                    replyContent={replyContent[item.id] || ''}
                    onReplyChange={(content) => setReplyContent(p => ({ ...p, [item.id]: content }))}
                    onReply={() => handleReply(item.id)}
                    isSubmitting={isSubmitting}
                  />
                ))
              )}
            </CardContent>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="status" className="flex-1 m-0">
          <CardContent className="pt-4">
            {reviewStatus ? (
              <div className="space-y-4">
                <ReviewStatusItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Script Review"
                  status={reviewStatus.script_review_status}
                  field="script_review_status"
                  isHost={isHost}
                  onUpdate={(status) => updateReviewStatus(sessionId, 'script_review_status', status)}
                />
                <ReviewStatusItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Title Review"
                  status={reviewStatus.title_review_status}
                  field="title_review_status"
                  isHost={isHost}
                  onUpdate={(status) => updateReviewStatus(sessionId, 'title_review_status', status)}
                />
                <ReviewStatusItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Schedule Review"
                  status={reviewStatus.schedule_review_status}
                  field="schedule_review_status"
                  isHost={isHost}
                  onUpdate={(status) => updateReviewStatus(sessionId, 'schedule_review_status', status)}
                />
                <ReviewStatusItem
                  icon={<Video className="h-5 w-5" />}
                  label="Recording Review"
                  status={reviewStatus.recording_review_status}
                  field="recording_review_status"
                  isHost={isHost}
                  onUpdate={(status) => updateReviewStatus(sessionId, 'recording_review_status', status)}
                />
                <ReviewStatusItem
                  icon={<Mic className="h-5 w-5" />}
                  label="Production Review"
                  status={reviewStatus.production_review_status}
                  field="production_review_status"
                  isHost={isHost}
                  onUpdate={(status) => updateReviewStatus(sessionId, 'production_review_status', status)}
                />

                <Separator className="my-4" />

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={cn(
                      'h-6 w-6',
                      reviewStatus.final_approval_status === 'approved' ? 'text-green-500' : 'text-gray-400'
                    )} />
                    <div>
                      <p className="font-medium">Final Approval</p>
                      <p className="text-sm text-muted-foreground">
                        {reviewStatus.pending_feedback_count} pending, {reviewStatus.resolved_feedback_count} resolved
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(
                    reviewStatus.final_approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    reviewStatus.final_approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {reviewStatus.final_approval_status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Loading review status...</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

interface FeedbackItemProps {
  item: SessionFeedback;
  isHost: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: FeedbackStatus) => void;
  replyContent: string;
  onReplyChange: (content: string) => void;
  onReply: () => void;
  isSubmitting: boolean;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({
  item,
  isHost,
  isExpanded,
  onToggle,
  onStatusChange,
  replyContent,
  onReplyChange,
  onReply,
  isSubmitting,
}) => {
  const statusOption = FEEDBACK_STATUS_OPTIONS.find(o => o.value === item.status);
  const typeOption = FEEDBACK_TYPE_OPTIONS.find(o => o.value === item.feedback_type);

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      item.is_from_host ? 'border-primary/30 bg-primary/5' : 'border-border'
    )}>
      <div
        className="p-4 cursor-pointer hover:bg-muted/50"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.is_from_host ? (
                <Badge variant="outline" className="text-xs bg-primary/10">
                  <User className="h-3 w-3 mr-1" />
                  Host
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {item.participant?.name || 'Participant'}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {typeOption?.icon} {typeOption?.label}
              </span>
              <Badge className={cn('text-xs', statusOption?.color)}>
                {statusOption?.label}
              </Badge>
            </div>
            {item.subject && (
              <p className="font-medium truncate">{item.subject}</p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.content}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(item.created_at), 'MMM d, h:mm a')}
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t">
          <div className="pt-4">
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
            
            {item.suggested_value && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Change:</p>
                <p className="text-sm italic">"{item.suggested_value}"</p>
              </div>
            )}

            {item.host_response && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Host Response:</p>
                <p className="text-sm">{item.host_response}</p>
              </div>
            )}
          </div>

          {isHost && (
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Status:</Label>
              <Select
                value={item.status}
                onValueChange={(v) => onStatusChange(v as FeedbackStatus)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Type a reply..."
              value={replyContent}
              onChange={(e) => onReplyChange(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onReply()}
            />
            <Button
              size="sm"
              onClick={onReply}
              disabled={isSubmitting || !replyContent.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {item.replies && item.replies.length > 0 && (
            <div className="pl-4 border-l-2 border-muted space-y-3">
              {item.replies.map(reply => (
                <div key={reply.id} className="text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {reply.is_from_host ? 'Host' : reply.participant?.name || 'Participant'}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(reply.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="mt-1">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ReviewStatusItemProps {
  icon: React.ReactNode;
  label: string;
  status: ReviewStatus;
  field: string;
  isHost: boolean;
  onUpdate: (status: ReviewStatus) => void;
}

const ReviewStatusItem: React.FC<ReviewStatusItemProps> = ({
  icon,
  label,
  status,
  field,
  isHost,
  onUpdate,
}) => {
  const statusOption = REVIEW_STATUS_OPTIONS.find(o => o.value === status);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      {isHost ? (
        <Select value={status} onValueChange={(v) => onUpdate(v as ReviewStatus)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge className={cn('text-xs', statusOption?.color)}>
          {statusOption?.label}
        </Badge>
      )}
    </div>
  );
};

export default SessionFeedbackPanel;
