/**
 * CollaborationPanel - Main collaboration UI for GenieSuite Cast
 *
 * Tabs:
 * 1. Comments   - Thread view, @mentions, resolve/unresolve, reactions
 * 2. Approvals  - Workflow cards, request review, approve/reject, publish
 * 3. Versions   - Version timeline, create/restore, side-by-side diff
 * 4. Team       - Member cards, roles, online status, invite dialog
 * 5. Activity   - Real-time activity feed with timestamps
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Users,
  Send,
  Plus,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  ArrowRight,
  Shield,
  Star,
  GitBranch,
  Activity,
  AtSign,
  Paperclip,
  ThumbsUp,
  RefreshCw,
  UserPlus,
  Crown,
  ChevronDown,
  ChevronRight,
  Circle,
  Filter,
  Archive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  useCollaboration,
  type CommentTarget,
  type Comment,
  type TeamRole,
  type ApprovalWorkflow,
  type Version,
  type ActivityItem,
} from '@/hooks/useCollaboration';
import { ApprovalWorkflowCard } from './ApprovalWorkflowCard';

// ============================================================================
// TYPES
// ============================================================================

interface CollaborationPanelProps {
  projectId: string;
  contentId?: string;
  contentType?: string;
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

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getRoleBadgeColor(role: TeamRole): string {
  const colors: Record<TeamRole, string> = {
    owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reviewer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    approver: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return colors[role] || colors.viewer;
}

function getRoleIcon(role: TeamRole): React.ReactNode {
  switch (role) {
    case 'owner': return <Crown className="h-3 w-3" />;
    case 'editor': return <Edit3 className="h-3 w-3" />;
    case 'reviewer': return <Eye className="h-3 w-3" />;
    case 'approver': return <Shield className="h-3 w-3" />;
    case 'viewer': return <Eye className="h-3 w-3" />;
    default: return null;
  }
}

function getActivityIcon(type: string): React.ReactNode {
  switch (type) {
    case 'comment_added': return <MessageSquare className="h-3.5 w-3.5 text-blue-400" />;
    case 'comment_resolved': return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
    case 'status_changed': return <RefreshCw className="h-3.5 w-3.5 text-yellow-400" />;
    case 'version_created': return <GitBranch className="h-3.5 w-3.5 text-purple-400" />;
    case 'assignment_changed': return <Users className="h-3.5 w-3.5 text-cyan-400" />;
    case 'review_requested': return <Clock className="h-3.5 w-3.5 text-orange-400" />;
    case 'review_completed': return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
    case 'content_edited': return <Edit3 className="h-3.5 w-3.5 text-blue-400" />;
    case 'content_approved': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    case 'content_rejected': return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    case 'content_published': return <Star className="h-3.5 w-3.5 text-amber-400" />;
    case 'mention': return <AtSign className="h-3.5 w-3.5 text-pink-400" />;
    default: return <Activity className="h-3.5 w-3.5 text-gray-400" />;
  }
}

const COMMENT_TARGET_LABELS: Record<CommentTarget, string> = {
  script: 'Script',
  scene: 'Scene',
  video: 'Video',
  clip: 'Clip',
  timeline: 'Timeline',
  thumbnail: 'Thumbnail',
  caption: 'Caption',
  audio: 'Audio',
  general: 'General',
};

const REACTION_EMOJIS = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F389}', '\u{1F440}', '\u{1F680}', '\u{2705}'];

// ============================================================================
// COMPONENT
// ============================================================================

export function CollaborationPanel({
  projectId,
  contentId,
  contentType,
  className = '',
}: CollaborationPanelProps) {
  const collab = useCollaboration(projectId);
  const [activeTab, setActiveTab] = useState('comments');

  // -- Comments state --
  const [commentText, setCommentText] = useState('');
  const [commentTarget, setCommentTarget] = useState<CommentTarget>('general');
  const [commentTargetId, setCommentTargetId] = useState(contentId || 'general');
  const [commentFilter, setCommentFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [targetFilter, setTargetFilter] = useState<CommentTarget | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);

  // -- Approvals state --
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [newWorkflowContentId, setNewWorkflowContentId] = useState(contentId || '');
  const [newWorkflowContentType, setNewWorkflowContentType] = useState(contentType || 'video');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  // -- Versions state --
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionChanges, setNewVersionChanges] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareV1, setCompareV1] = useState<string>('');
  const [compareV2, setCompareV2] = useState<string>('');

  // -- Team state --
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');

  // ========================================================================
  // COMMENTS TAB
  // ========================================================================

  const filteredComments = useMemo(() => {
    let result = collab.comments.filter((c) => !c.parentId);

    if (commentFilter === 'unresolved') result = result.filter((c) => !c.resolved);
    if (commentFilter === 'resolved') result = result.filter((c) => c.resolved);
    if (targetFilter !== 'all') result = result.filter((c) => c.targetType === targetFilter);

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [collab.comments, commentFilter, targetFilter]);

  const getReplies = (parentId: string): Comment[] => {
    return collab.comments
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const mentionMatches = commentText.match(/@(\w+)/g) || [];
    const mentions = mentionMatches
      .map((m) => {
        const name = m.slice(1).toLowerCase();
        const member = collab.teamMembers.find((tm) => tm.name.toLowerCase().includes(name));
        return member?.id;
      })
      .filter(Boolean) as string[];

    collab.addComment(commentTarget, commentTargetId, commentText, mentions);
    setCommentText('');
  };

  const handleReply = (parentId: string) => {
    if (!replyText.trim()) return;
    collab.replyToComment(parentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleEditSave = (commentId: string) => {
    if (!editText.trim()) return;
    collab.editComment(commentId, editText);
    setEditingComment(null);
    setEditText('');
  };

  const renderCommentCard = (comment: Comment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isOwn = comment.authorId === collab.currentUser.id;
    const replies = isReply ? [] : getReplies(comment.id);

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 border-l-2 border-white/10 pl-4' : ''} ${comment.resolved ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start gap-3 py-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback className="bg-white/10 text-xs">{getInitials(comment.authorName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">{comment.authorName}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-white/50">
                {COMMENT_TARGET_LABELS[comment.targetType]}
              </Badge>
              <span className="text-xs text-white/40">{formatTimestamp(comment.timestamp)}</span>
              {comment.editedAt && <span className="text-xs text-white/30">(edited)</span>}
              {comment.resolved && (
                <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border-green-500/30">
                  Resolved
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2 mt-1">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 h-8 text-sm bg-white/5 border-white/10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(comment.id);
                    if (e.key === 'Escape') setEditingComment(null);
                  }}
                />
                <Button size="sm" variant="ghost" onClick={() => handleEditSave(comment.id)} className="h-8 px-2">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)} className="h-8 px-2">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-white/70 whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Reactions */}
            {Object.keys(comment.reactions).length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {Object.entries(comment.reactions).map(([emoji, userIds]) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      if (userIds.includes(collab.currentUser.id)) {
                        collab.removeReaction(comment.id, emoji);
                      } else {
                        collab.addReaction(comment.id, emoji);
                      }
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                      userIds.includes(collab.currentUser.id)
                        ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {emoji} {userIds.length}
                  </button>
                ))}
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-1 mt-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-white/70"
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-white/40 hover:text-white/70"
                onClick={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                React
              </Button>
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-white/70"
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditText(comment.content);
                  }}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
              {!comment.resolved ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-green-400"
                  onClick={() => collab.resolveComment(comment.id)}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-yellow-400"
                  onClick={() => collab.unresolveComment(comment.id)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reopen
                </Button>
              )}
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-red-400"
                  onClick={() => collab.deleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            {/* Reaction picker */}
            {showReactions === comment.id && (
              <div className="flex gap-1 mt-2 p-2 rounded-lg bg-white/5 border border-white/10 w-fit">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      collab.addReaction(comment.id, emoji);
                      setShowReactions(null);
                    }}
                    className="hover:scale-125 transition-transform p-1 text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 h-8 text-sm bg-white/5 border-white/10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleReply(comment.id);
                  }}
                />
                <Button size="sm" onClick={() => handleReply(comment.id)} className="h-8 px-3" disabled={!replyText.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Threaded replies */}
            {replies.length > 0 && (
              <div className="mt-2">{replies.map((reply) => renderCommentCard(reply, true))}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const commentsTab = (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-white/40" />
          <span className="text-xs text-white/40">Filter:</span>
        </div>
        <Select value={commentFilter} onValueChange={(v) => setCommentFilter(v as typeof commentFilter)}>
          <SelectTrigger className="h-7 w-[120px] text-xs bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={targetFilter} onValueChange={(v) => setTargetFilter(v as typeof targetFilter)}>
          <SelectTrigger className="h-7 w-[120px] text-xs bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            {(Object.keys(COMMENT_TARGET_LABELS) as CommentTarget[]).map((t) => (
              <SelectItem key={t} value={t}>{COMMENT_TARGET_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs border-white/20 text-white/50">
          {collab.unresolvedCount} unresolved
        </Badge>
      </div>

      {/* Comment input */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-3">
          <div className="flex gap-2 mb-2">
            <Select value={commentTarget} onValueChange={(v) => setCommentTarget(v as CommentTarget)}>
              <SelectTrigger className="h-8 w-[130px] text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COMMENT_TARGET_LABELS) as CommentTarget[]).map((t) => (
                  <SelectItem key={t} value={t}>{COMMENT_TARGET_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={commentTargetId}
              onChange={(e) => setCommentTargetId(e.target.value)}
              placeholder="Target ID"
              className="h-8 w-[140px] text-xs bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment... Use @name to mention team members"
              className="flex-1 min-h-[60px] text-sm bg-white/5 border-white/10 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-white/30">
              <AtSign className="h-3 w-3" />
              <span>@mention</span>
              <Paperclip className="h-3 w-3 ml-2" />
              <span>attach</span>
            </div>
            <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()} className="h-7 px-3 text-xs">
              <Send className="h-3 w-3 mr-1" />
              Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-1 divide-y divide-white/5">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Start the conversation above</p>
            </div>
          ) : (
            filteredComments.map((comment) => renderCommentCard(comment))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ========================================================================
  // APPROVALS TAB
  // ========================================================================

  const handleCreateWorkflow = () => {
    if (!newWorkflowContentId.trim() || selectedReviewers.length === 0) return;
    collab.createWorkflow(newWorkflowContentId, newWorkflowContentType, selectedReviewers);
    setShowCreateWorkflow(false);
    setNewWorkflowContentId(contentId || '');
    setNewWorkflowContentType(contentType || 'video');
    setSelectedReviewers([]);
  };

  const toggleReviewer = (memberId: string) => {
    setSelectedReviewers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const approvalsTab = (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-white/20 text-white/50">
            {collab.pendingReviewCount} pending review
          </Badge>
          <Badge variant="outline" className="text-xs border-white/20 text-white/50">
            {collab.workflows.length} total
          </Badge>
        </div>
        <Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create Approval Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs text-white/60">Content ID</Label>
                <Input
                  value={newWorkflowContentId}
                  onChange={(e) => setNewWorkflowContentId(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                  placeholder="e.g. video_001"
                />
              </div>
              <div>
                <Label className="text-xs text-white/60">Content Type</Label>
                <Select value={newWorkflowContentType} onValueChange={setNewWorkflowContentType}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="scene">Scene</SelectItem>
                    <SelectItem value="thumbnail">Thumbnail</SelectItem>
                    <SelectItem value="caption">Caption</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/60">Select Reviewers</Label>
                <div className="mt-2 space-y-2">
                  {collab.teamMembers
                    .filter((m) => m.id !== collab.currentUser.id)
                    .map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleReviewer(member.id)}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg border transition-colors ${
                          selectedReviewers.includes(member.id)
                            ? 'bg-blue-500/20 border-blue-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-white/10 text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-sm text-white">{member.name}</p>
                          <p className="text-xs text-white/40">{member.role}</p>
                        </div>
                        {selectedReviewers.includes(member.id) && (
                          <CheckCircle2 className="h-4 w-4 text-blue-400 ml-auto" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
              <Button onClick={handleCreateWorkflow} disabled={!newWorkflowContentId.trim() || selectedReviewers.length === 0} className="w-full">
                Create Workflow ({selectedReviewers.length} reviewer{selectedReviewers.length !== 1 ? 's' : ''})
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow cards */}
      <ScrollArea className="h-[440px]">
        <div className="space-y-4">
          {collab.workflows.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No approval workflows</p>
              <p className="text-xs mt-1">Create one to start the review process</p>
            </div>
          ) : (
            collab.workflows
              .filter((w) => w.status !== 'archived')
              .map((workflow) => (
                <ApprovalWorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  currentUserId={collab.currentUser.id}
                  onApprove={(wfId, feedback) => collab.approveContent(wfId, feedback)}
                  onRequestChanges={(wfId, feedback) => collab.requestChanges(wfId, feedback)}
                  onPublish={(wfId) => collab.publishContent(wfId)}
                />
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ========================================================================
  // VERSIONS TAB
  // ========================================================================

  const handleCreateVersion = () => {
    if (!newVersionLabel.trim()) return;
    const changes = newVersionChanges
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);
    collab.createVersion(contentId || 'content_default', newVersionLabel, { label: newVersionLabel, timestamp: new Date().toISOString() }, changes);
    setShowCreateVersion(false);
    setNewVersionLabel('');
    setNewVersionChanges('');
  };

  const diffResult = useMemo(() => {
    if (!compareMode || !compareV1 || !compareV2) return null;
    return collab.compareVersions(compareV1, compareV2);
  }, [compareMode, compareV1, compareV2, collab]);

  const allVersions = collab.versions.sort((a, b) => b.versionNumber - a.versionNumber);

  const versionsTab = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-white/20 text-white/50">
            {allVersions.length} version{allVersions.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs ${compareMode ? 'text-blue-400' : 'text-white/50'}`}
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareV1('');
              setCompareV2('');
            }}
          >
            <GitBranch className="h-3 w-3 mr-1" />
            Compare
          </Button>
        </div>
        <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              New Version
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs text-white/60">Version Label</Label>
                <Input
                  value={newVersionLabel}
                  onChange={(e) => setNewVersionLabel(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                  placeholder="e.g. v3.0 - Final Cuts"
                />
              </div>
              <div>
                <Label className="text-xs text-white/60">Changes (one per line)</Label>
                <Textarea
                  value={newVersionChanges}
                  onChange={(e) => setNewVersionChanges(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 min-h-[80px]"
                  placeholder="Updated intro sequence&#10;Fixed audio sync&#10;Added end card"
                />
              </div>
              <Button onClick={handleCreateVersion} disabled={!newVersionLabel.trim()} className="w-full">
                Create Version
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compare mode selectors */}
      {compareMode && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-3 space-y-3">
            <p className="text-xs text-white/40 font-medium">Select two versions to compare</p>
            <div className="flex gap-3 items-center">
              <Select value={compareV1} onValueChange={setCompareV1}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 flex-1">
                  <SelectValue placeholder="Version A" />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowRight className="h-4 w-4 text-white/30 shrink-0" />
              <Select value={compareV2} onValueChange={setCompareV2}>
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 flex-1">
                  <SelectValue placeholder="Version B" />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {diffResult && (
              <div className="space-y-2 pt-2">
                {diffResult.added.length > 0 && (
                  <div>
                    <p className="text-xs text-green-400 font-medium mb-1">Added</p>
                    {diffResult.added.map((item) => (
                      <p key={item} className="text-xs text-green-300/70 pl-3">+ {item}</p>
                    ))}
                  </div>
                )}
                {diffResult.removed.length > 0 && (
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-1">Removed</p>
                    {diffResult.removed.map((item) => (
                      <p key={item} className="text-xs text-red-300/70 pl-3">- {item}</p>
                    ))}
                  </div>
                )}
                {diffResult.modified.length > 0 && (
                  <div>
                    <p className="text-xs text-yellow-400 font-medium mb-1">Modified</p>
                    {diffResult.modified.map((item) => (
                      <p key={item} className="text-xs text-yellow-300/70 pl-3">~ {item}</p>
                    ))}
                  </div>
                )}
                {diffResult.added.length === 0 && diffResult.removed.length === 0 && diffResult.modified.length === 0 && (
                  <p className="text-xs text-white/30">No differences found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Version timeline */}
      <ScrollArea className={compareMode ? 'h-[280px]' : 'h-[420px]'}>
        <div className="space-y-1">
          {allVersions.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No versions yet</p>
              <p className="text-xs mt-1">Create your first version to start tracking changes</p>
            </div>
          ) : (
            allVersions.map((version, idx) => (
              <div key={version.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center w-6 shrink-0">
                  <div
                    className={`h-3 w-3 rounded-full border-2 mt-4 ${
                      version.isCurrent
                        ? 'bg-blue-500 border-blue-400'
                        : 'bg-transparent border-white/30'
                    }`}
                  />
                  {idx < allVersions.length - 1 && <div className="w-0.5 flex-1 bg-white/10" />}
                </div>

                {/* Version card */}
                <Card className={`flex-1 mb-2 ${version.isCurrent ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/10'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{version.label}</span>
                        {version.isCurrent && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Current
                          </Badge>
                        )}
                      </div>
                      {!version.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-white/40 hover:text-white/70"
                          onClick={() => collab.restoreVersion(version.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-white/40">
                      by {version.createdBy} &middot; {formatTimestamp(version.createdAt)}
                    </p>
                    {version.changes.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {version.changes.map((change, ci) => (
                          <p key={ci} className="text-xs text-white/50 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-white/30" />
                            {change}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ========================================================================
  // TEAM TAB
  // ========================================================================

  const handleInviteMember = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    collab.addTeamMember(inviteName, inviteEmail, inviteRole);
    setShowInvite(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('viewer');
  };

  const teamTab = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-white/20 text-white/50">
            {collab.teamMembers.length} members
          </Badge>
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
            {collab.teamMembers.filter((m) => m.online).length} online
          </Badge>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs text-white/60">Name</Label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label className="text-xs text-white/60">Email</Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                  placeholder="email@company.com"
                  type="email"
                />
              </div>
              <div>
                <Label className="text-xs text-white/60">Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInviteMember} disabled={!inviteName.trim() || !inviteEmail.trim()} className="w-full">
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team list */}
      <ScrollArea className="h-[440px]">
        <div className="space-y-2">
          {collab.teamMembers.map((member) => {
            const isCurrentUser = member.id === collab.currentUser.id;
            return (
              <Card key={member.id} className="bg-white/5 border-white/10">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-white/10 text-sm">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 ${
                          member.online ? 'bg-emerald-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{member.name}</span>
                        {isCurrentUser && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-white/10 text-white/50 border-white/20">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-[10px] px-2 py-0.5 border ${getRoleBadgeColor(member.role)}`}>
                        <span className="mr-1">{getRoleIcon(member.role)}</span>
                        {member.role}
                      </Badge>
                      {!isCurrentUser && (
                        <Select
                          value={member.role}
                          onValueChange={(v) => collab.updateMemberRole(member.id, v as TeamRole)}
                        >
                          <SelectTrigger className="h-7 w-7 p-0 bg-transparent border-none">
                            <MoreHorizontal className="h-4 w-4 text-white/30" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="approver">Approver</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  {/* Assigned content */}
                  {member.assignedContent.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.assignedContent.map((cid) => (
                        <Badge key={cid} variant="outline" className="text-[10px] border-white/10 text-white/40">
                          {cid}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-white/25 mt-2">
                    {member.online ? 'Online now' : `Last active ${formatTimestamp(member.lastActive)}`}
                  </p>
                  {!isCurrentUser && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-red-400/60 hover:text-red-400"
                        onClick={() => collab.removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  // ========================================================================
  // ACTIVITY TAB
  // ========================================================================

  const recentActivities = collab.getRecentActivities(50);

  const activityTab = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs border-white/20 text-white/50">
          {recentActivities.length} events
        </Badge>
      </div>

      {/* Activity feed */}
      <ScrollArea className="h-[460px]">
        <div className="space-y-1">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs mt-1">Actions will appear here as they happen</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="mt-0.5 p-1.5 rounded-full bg-white/5 shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">
                    <span className="text-white font-medium">{activity.actorName}</span>{' '}
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">{formatTimestamp(activity.timestamp)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 text-white/30">
                      {activity.targetType}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <Card className={`bg-gray-900/50 border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Collaboration
            </CardTitle>
            <CardDescription className="text-white/40 text-sm mt-0.5">
              Comments, approvals, versions &amp; team management
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {collab.unresolvedCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                {collab.unresolvedCount} unresolved
              </Badge>
            )}
            {collab.pendingReviewCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {collab.pendingReviewCount} to review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-4 w-full grid grid-cols-5">
            <TabsTrigger value="comments" className="text-xs data-[state=active]:bg-white/10">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Comments
              {collab.unresolvedCount > 0 && (
                <span className="ml-1.5 bg-orange-500/30 text-orange-300 text-[10px] px-1.5 rounded-full">
                  {collab.unresolvedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs data-[state=active]:bg-white/10">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Approvals
              {collab.pendingReviewCount > 0 && (
                <span className="ml-1.5 bg-blue-500/30 text-blue-300 text-[10px] px-1.5 rounded-full">
                  {collab.pendingReviewCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs data-[state=active]:bg-white/10">
              <GitBranch className="h-3.5 w-3.5 mr-1.5" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs data-[state=active]:bg-white/10">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-white/10">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-0">{commentsTab}</TabsContent>
          <TabsContent value="approvals" className="mt-0">{approvalsTab}</TabsContent>
          <TabsContent value="versions" className="mt-0">{versionsTab}</TabsContent>
          <TabsContent value="team" className="mt-0">{teamTab}</TabsContent>
          <TabsContent value="activity" className="mt-0">{activityTab}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
