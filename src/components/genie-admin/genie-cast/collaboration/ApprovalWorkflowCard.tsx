/**
 * ApprovalWorkflowCard - Reusable card for a single approval workflow
 *
 * Displays:
 * - Visual pipeline: Draft -> Review -> Approved -> Published
 * - Reviewer decisions (approved / rejected / pending)
 * - Deadline countdown
 * - Action buttons (approve, request changes, publish)
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  Send,
  Circle,
  Eye,
  MessageSquare,
  Archive,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { ApprovalWorkflow, ApprovalStatus } from '@/hooks/useCollaboration';

// ============================================================================
// TYPES
// ============================================================================

interface ApprovalWorkflowCardProps {
  workflow: ApprovalWorkflow;
  currentUserId: string;
  onApprove?: (workflowId: string, feedback?: string) => void;
  onRequestChanges?: (workflowId: string, feedback: string) => void;
  onPublish?: (workflowId: string) => void;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getStatusConfig(status: ApprovalStatus): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'draft':
      return { label: 'Draft', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
    case 'pending_review':
      return { label: 'Pending Review', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' };
    case 'in_review':
      return { label: 'In Review', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' };
    case 'changes_requested':
      return { label: 'Changes Requested', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' };
    case 'approved':
      return { label: 'Approved', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' };
    case 'published':
      return { label: 'Published', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' };
    case 'archived':
      return { label: 'Archived', color: 'text-gray-500', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-600/30' };
    default:
      return { label: status, color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
  }
}

function getDeadlineInfo(deadline?: string): { text: string; urgent: boolean } | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();

  if (diffMs < 0) {
    const overdueDays = Math.ceil(Math.abs(diffMs) / 86400000);
    return { text: `Overdue by ${overdueDays}d`, urgent: true };
  }

  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / 60000);
    return { text: `${mins}m remaining`, urgent: true };
  }
  if (diffHours < 24) {
    return { text: `${diffHours}h remaining`, urgent: diffHours < 4 };
  }
  return { text: `${diffDays}d remaining`, urgent: false };
}

function getDecisionIcon(decision?: string): React.ReactNode {
  switch (decision) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-400" />;
  }
}

function getStageIcon(status: string): React.ReactNode {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'active':
      return <Circle className="h-4 w-4 text-blue-400 fill-blue-400" />;
    case 'skipped':
      return <ArrowRight className="h-4 w-4 text-gray-500" />;
    case 'pending':
    default:
      return <Circle className="h-4 w-4 text-white/20" />;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ApprovalWorkflowCard({
  workflow,
  currentUserId,
  onApprove,
  onRequestChanges,
  onPublish,
  className = '',
}: ApprovalWorkflowCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackAction, setFeedbackAction] = useState<'approve' | 'reject'>('approve');
  const [expanded, setExpanded] = useState(true);

  const statusConfig = getStatusConfig(workflow.status);
  const deadlineInfo = getDeadlineInfo(workflow.deadline);

  const currentUserReviewer = useMemo(() => {
    return workflow.reviewers.find((r) => r.id === currentUserId);
  }, [workflow.reviewers, currentUserId]);

  const canApprove = currentUserReviewer && currentUserReviewer.decision === 'pending' &&
    (workflow.status === 'pending_review' || workflow.status === 'in_review');

  const canPublish = workflow.status === 'approved' && workflow.requester.id === currentUserId;

  const approvalProgress = workflow.requiredApprovals > 0
    ? (workflow.currentApprovals / workflow.requiredApprovals) * 100
    : 0;

  const handleFeedbackSubmit = () => {
    if (feedbackAction === 'approve') {
      onApprove?.(workflow.id, feedbackText || undefined);
    } else {
      if (!feedbackText.trim()) return;
      onRequestChanges?.(workflow.id, feedbackText);
    }
    setShowFeedback(false);
    setFeedbackText('');
  };

  return (
    <Card className={`bg-white/5 border-white/10 overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="h-5 w-5 text-white/40 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white truncate">
                  {workflow.contentType} &middot; {workflow.contentId}
                </span>
                <Badge className={`text-[10px] px-2 py-0.5 border ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                Requested by {workflow.requester.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deadlineInfo && (
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 border ${
                  deadlineInfo.urgent
                    ? 'border-red-500/30 text-red-400 bg-red-500/10'
                    : 'border-white/20 text-white/50'
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {deadlineInfo.text}
              </Badge>
            )}
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-white/30" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/30" />
            )}
          </div>
        </button>

        {expanded && (
          <>
            <Separator className="bg-white/5" />

            {/* Pipeline stages */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {workflow.stages.map((stage, idx) => (
                  <React.Fragment key={stage.name}>
                    <div className="flex flex-col items-center gap-1">
                      {getStageIcon(stage.status)}
                      <span
                        className={`text-[10px] font-medium ${
                          stage.status === 'active'
                            ? 'text-blue-400'
                            : stage.status === 'completed'
                            ? 'text-emerald-400'
                            : 'text-white/30'
                        }`}
                      >
                        {stage.name}
                      </span>
                    </div>
                    {idx < workflow.stages.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          stage.status === 'completed' ? 'bg-emerald-500/40' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Approval progress */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Approvals</span>
                <span className="text-xs text-white/70 font-medium">
                  {workflow.currentApprovals} / {workflow.requiredApprovals} required
                </span>
              </div>
              <Progress value={approvalProgress} className="h-1.5" />
            </div>

            <Separator className="bg-white/5" />

            {/* Reviewers */}
            <div className="px-4 py-3 space-y-2">
              <span className="text-xs text-white/50 font-medium">Reviewers</span>
              {workflow.reviewers.map((reviewer) => (
                <div key={reviewer.id} className="flex items-center gap-3 py-1.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-white/10 text-[10px]">{getInitials(reviewer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate">{reviewer.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-white/40">
                        {reviewer.role}
                      </Badge>
                    </div>
                    {reviewer.feedback && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {reviewer.feedback}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    {getDecisionIcon(reviewer.decision)}
                    <span
                      className={`text-xs ${
                        reviewer.decision === 'approved'
                          ? 'text-emerald-400'
                          : reviewer.decision === 'rejected'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {reviewer.decision === 'approved'
                        ? 'Approved'
                        : reviewer.decision === 'rejected'
                        ? 'Rejected'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback input (shown when user clicks approve/reject) */}
            {showFeedback && (
              <>
                <Separator className="bg-white/5" />
                <div className="px-4 py-3 space-y-2">
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={
                      feedbackAction === 'approve'
                        ? 'Optional feedback...'
                        : 'Describe changes needed (required)...'
                    }
                    className="min-h-[60px] text-sm bg-white/5 border-white/10 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setShowFeedback(false);
                        setFeedbackText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className={`h-7 text-xs ${
                        feedbackAction === 'approve'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackAction === 'reject' && !feedbackText.trim()}
                    >
                      {feedbackAction === 'approve' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Request Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            {(canApprove || canPublish) && !showFeedback && (
              <>
                <Separator className="bg-white/5" />
                <div className="px-4 py-3 flex gap-2 justify-end">
                  {canApprove && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                        onClick={() => {
                          setFeedbackAction('reject');
                          setShowFeedback(true);
                          setFeedbackText('');
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setFeedbackAction('approve');
                          setShowFeedback(true);
                          setFeedbackText('');
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                    </>
                  )}
                  {canPublish && (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
                      onClick={() => onPublish?.(workflow.id)}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Publish
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
