/**
 * useCollaboration - Collaboration & Approval Workflows for GenieSuite Cast
 *
 * Manages:
 * 1. Comments on content (scripts, videos, scenes, timeline clips)
 * 2. Approval workflows (draft -> review -> approved -> published)
 * 3. Version history tracking
 * 4. Team member assignment
 * 5. Real-time activity feed
 * 6. Mentions (@user)
 */

import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ApprovalStatus =
  | 'draft'
  | 'pending_review'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'archived';

export type CommentTarget =
  | 'script'
  | 'scene'
  | 'video'
  | 'clip'
  | 'timeline'
  | 'thumbnail'
  | 'caption'
  | 'audio'
  | 'general';

export type TeamRole = 'owner' | 'editor' | 'reviewer' | 'viewer' | 'approver';

export type ActivityType =
  | 'comment_added'
  | 'comment_resolved'
  | 'status_changed'
  | 'version_created'
  | 'assignment_changed'
  | 'review_requested'
  | 'review_completed'
  | 'content_edited'
  | 'content_approved'
  | 'content_rejected'
  | 'content_published'
  | 'mention';

export interface Comment {
  id: string;
  targetType: CommentTarget;
  targetId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  parentId?: string;
  mentions: string[];
  attachments: string[];
  editedAt?: string;
  reactions: Record<string, string[]>;
}

export interface ApprovalWorkflow {
  id: string;
  contentId: string;
  contentType: string;
  status: ApprovalStatus;
  requester: { id: string; name: string };
  reviewers: Array<{
    id: string;
    name: string;
    role: TeamRole;
    decision?: 'approved' | 'rejected' | 'pending';
    feedback?: string;
    decidedAt?: string;
  }>;
  requiredApprovals: number;
  currentApprovals: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  stages: Array<{
    name: string;
    status: 'pending' | 'active' | 'completed' | 'skipped';
    completedAt?: string;
  }>;
}

export interface Version {
  id: string;
  contentId: string;
  versionNumber: number;
  label: string;
  description: string;
  createdBy: string;
  createdAt: string;
  snapshot: Record<string, any>;
  changes: string[];
  isCurrent: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  assignedContent: string[];
  lastActive: string;
  online: boolean;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  targetId: string;
  targetType: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CollaborationHook {
  // Comments
  comments: Comment[];
  addComment: (targetType: CommentTarget, targetId: string, content: string, mentions?: string[]) => string;
  replyToComment: (parentId: string, content: string) => string;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  resolveComment: (commentId: string) => void;
  unresolveComment: (commentId: string) => void;
  addReaction: (commentId: string, emoji: string) => void;
  removeReaction: (commentId: string, emoji: string) => void;
  getCommentsForTarget: (targetType: CommentTarget, targetId: string) => Comment[];
  unresolvedCount: number;

  // Approvals
  workflows: ApprovalWorkflow[];
  createWorkflow: (contentId: string, contentType: string, reviewerIds: string[]) => string;
  submitForReview: (workflowId: string) => void;
  approveContent: (workflowId: string, feedback?: string) => void;
  requestChanges: (workflowId: string, feedback: string) => void;
  publishContent: (workflowId: string) => void;
  archiveWorkflow: (workflowId: string) => void;
  getWorkflowForContent: (contentId: string) => ApprovalWorkflow | undefined;
  pendingReviewCount: number;

  // Versions
  versions: Version[];
  createVersion: (contentId: string, label: string, snapshot: Record<string, any>, changes?: string[]) => string;
  restoreVersion: (versionId: string) => Record<string, any>;
  compareVersions: (v1Id: string, v2Id: string) => { added: string[]; removed: string[]; modified: string[] };
  getCurrentVersion: (contentId: string) => Version | undefined;
  getVersionHistory: (contentId: string) => Version[];

  // Team
  teamMembers: TeamMember[];
  addTeamMember: (name: string, email: string, role: TeamRole) => string;
  removeTeamMember: (memberId: string) => void;
  updateMemberRole: (memberId: string, role: TeamRole) => void;
  assignContent: (memberId: string, contentId: string) => void;
  unassignContent: (memberId: string, contentId: string) => void;

  // Activity
  activities: ActivityItem[];
  getRecentActivities: (limit?: number) => ActivityItem[];
  getActivitiesForContent: (contentId: string) => ActivityItem[];

  // Current user
  currentUser: TeamMember;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_CURRENT_USER: TeamMember = {
  id: 'user_owner_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@geniesuite.io',
  avatar: undefined,
  role: 'owner',
  assignedContent: [],
  lastActive: nowISO(),
  online: true,
};

function createDefaultTeam(): TeamMember[] {
  return [
    { ...DEFAULT_CURRENT_USER },
    {
      id: 'user_editor_002',
      name: 'Jordan Lee',
      email: 'jordan.lee@geniesuite.io',
      avatar: undefined,
      role: 'editor',
      assignedContent: [],
      lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      online: true,
    },
    {
      id: 'user_reviewer_003',
      name: 'Taylor Chen',
      email: 'taylor.chen@geniesuite.io',
      avatar: undefined,
      role: 'reviewer',
      assignedContent: [],
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      online: false,
    },
    {
      id: 'user_approver_004',
      name: 'Sam Rivera',
      email: 'sam.rivera@geniesuite.io',
      avatar: undefined,
      role: 'approver',
      assignedContent: [],
      lastActive: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      online: true,
    },
  ];
}

function createSampleComments(): Comment[] {
  const base = Date.now();
  return [
    {
      id: 'cmt_sample_001',
      targetType: 'script',
      targetId: 'script_001',
      authorId: 'user_editor_002',
      authorName: 'Jordan Lee',
      content: 'The opening hook could be stronger. Consider starting with a question to engage viewers immediately.',
      timestamp: new Date(base - 3 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      mentions: [],
      attachments: [],
      reactions: { '\u{1F44D}': ['user_owner_001'] },
    },
    {
      id: 'cmt_sample_002',
      targetType: 'script',
      targetId: 'script_001',
      authorId: 'user_owner_001',
      authorName: 'Alex Morgan',
      content: 'Good point @Jordan Lee. I\'ll revise the first 10 seconds. What about: "Ever wondered how AI can transform your workflow?"',
      timestamp: new Date(base - 2.5 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      parentId: 'cmt_sample_001',
      mentions: ['user_editor_002'],
      attachments: [],
      reactions: {},
    },
    {
      id: 'cmt_sample_003',
      targetType: 'scene',
      targetId: 'scene_003',
      authorId: 'user_reviewer_003',
      authorName: 'Taylor Chen',
      content: 'The transition between scenes 2 and 3 feels abrupt. A dissolve or cross-fade might work better here.',
      timestamp: new Date(base - 1 * 60 * 60 * 1000).toISOString(),
      resolved: true,
      resolvedBy: 'user_owner_001',
      resolvedAt: new Date(base - 30 * 60 * 1000).toISOString(),
      mentions: [],
      attachments: [],
      reactions: { '\u{2705}': ['user_owner_001', 'user_editor_002'] },
    },
  ];
}

function createSampleWorkflows(): ApprovalWorkflow[] {
  const base = Date.now();
  return [
    {
      id: 'wf_sample_001',
      contentId: 'video_001',
      contentType: 'video',
      status: 'in_review',
      requester: { id: 'user_owner_001', name: 'Alex Morgan' },
      reviewers: [
        { id: 'user_reviewer_003', name: 'Taylor Chen', role: 'reviewer', decision: 'approved', feedback: 'Looks great overall.', decidedAt: new Date(base - 60 * 60 * 1000).toISOString() },
        { id: 'user_approver_004', name: 'Sam Rivera', role: 'approver', decision: 'pending' },
      ],
      requiredApprovals: 2,
      currentApprovals: 1,
      createdAt: new Date(base - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(base - 60 * 60 * 1000).toISOString(),
      deadline: new Date(base + 24 * 60 * 60 * 1000).toISOString(),
      stages: [
        { name: 'Draft', status: 'completed', completedAt: new Date(base - 4 * 60 * 60 * 1000).toISOString() },
        { name: 'Review', status: 'active' },
        { name: 'Approval', status: 'pending' },
        { name: 'Published', status: 'pending' },
      ],
    },
  ];
}

function createSampleVersions(): Version[] {
  const base = Date.now();
  return [
    {
      id: 'ver_sample_001',
      contentId: 'video_001',
      versionNumber: 1,
      label: 'v1.0 - Initial Draft',
      description: 'First version with base script and scene layout',
      createdBy: 'Alex Morgan',
      createdAt: new Date(base - 48 * 60 * 60 * 1000).toISOString(),
      snapshot: { title: 'Product Launch Video', scenes: 5, duration: '2:30' },
      changes: ['Created initial script', 'Added 5 scenes', 'Set 2:30 target duration'],
      isCurrent: false,
    },
    {
      id: 'ver_sample_002',
      contentId: 'video_001',
      versionNumber: 2,
      label: 'v2.0 - Review Feedback',
      description: 'Incorporated reviewer feedback on pacing and transitions',
      createdBy: 'Alex Morgan',
      createdAt: new Date(base - 6 * 60 * 60 * 1000).toISOString(),
      snapshot: { title: 'Product Launch Video', scenes: 6, duration: '2:45' },
      changes: ['Revised opening hook', 'Added transition scene', 'Updated pacing for scenes 3-4'],
      isCurrent: true,
    },
  ];
}

function createSampleActivities(): ActivityItem[] {
  const base = Date.now();
  return [
    {
      id: 'act_sample_001',
      type: 'version_created',
      actorId: 'user_owner_001',
      actorName: 'Alex Morgan',
      targetId: 'video_001',
      targetType: 'video',
      description: 'Created version v2.0 - Review Feedback',
      timestamp: new Date(base - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_sample_002',
      type: 'review_requested',
      actorId: 'user_owner_001',
      actorName: 'Alex Morgan',
      targetId: 'video_001',
      targetType: 'video',
      description: 'Submitted video for review',
      timestamp: new Date(base - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_sample_003',
      type: 'comment_added',
      actorId: 'user_editor_002',
      actorName: 'Jordan Lee',
      targetId: 'script_001',
      targetType: 'script',
      description: 'Commented on script: "The opening hook could be stronger..."',
      timestamp: new Date(base - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_sample_004',
      type: 'content_approved',
      actorId: 'user_reviewer_003',
      actorName: 'Taylor Chen',
      targetId: 'video_001',
      targetType: 'video',
      description: 'Approved video with feedback: "Looks great overall."',
      timestamp: new Date(base - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_sample_005',
      type: 'comment_resolved',
      actorId: 'user_owner_001',
      actorName: 'Alex Morgan',
      targetId: 'scene_003',
      targetType: 'scene',
      description: 'Resolved comment about scene transitions',
      timestamp: new Date(base - 30 * 60 * 1000).toISOString(),
    },
  ];
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useCollaboration(_projectId?: string): CollaborationHook {
  const [comments, setComments] = useState<Comment[]>(createSampleComments);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(createSampleWorkflows);
  const [versions, setVersions] = useState<Version[]>(createSampleVersions);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(createDefaultTeam);
  const [activities, setActivities] = useState<ActivityItem[]>(createSampleActivities);

  const currentUser = useMemo(() => {
    return teamMembers.find((m) => m.id === DEFAULT_CURRENT_USER.id) || DEFAULT_CURRENT_USER;
  }, [teamMembers]);

  // ---- Activity logging helper ----
  const logActivity = useCallback(
    (type: ActivityType, targetId: string, targetType: string, description: string, metadata?: Record<string, any>) => {
      const item: ActivityItem = {
        id: generateId('act'),
        type,
        actorId: currentUser.id,
        actorName: currentUser.name,
        targetId,
        targetType,
        description,
        timestamp: nowISO(),
        metadata,
      };
      setActivities((prev) => [item, ...prev]);
    },
    [currentUser],
  );

  // ========================================================================
  // COMMENTS
  // ========================================================================

  const addComment = useCallback(
    (targetType: CommentTarget, targetId: string, content: string, mentions: string[] = []): string => {
      const id = generateId('cmt');
      const comment: Comment = {
        id,
        targetType,
        targetId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content,
        timestamp: nowISO(),
        resolved: false,
        mentions,
        attachments: [],
        reactions: {},
      };
      setComments((prev) => [...prev, comment]);
      logActivity('comment_added', targetId, targetType, `Commented on ${targetType}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`);

      // Log mention activities
      mentions.forEach((mentionedId) => {
        const mentionedMember = teamMembers.find((m) => m.id === mentionedId);
        if (mentionedMember) {
          const mentionItem: ActivityItem = {
            id: generateId('act'),
            type: 'mention',
            actorId: currentUser.id,
            actorName: currentUser.name,
            targetId,
            targetType,
            description: `Mentioned ${mentionedMember.name} in a comment on ${targetType}`,
            timestamp: nowISO(),
            metadata: { mentionedUserId: mentionedId },
          };
          setActivities((prev) => [mentionItem, ...prev]);
        }
      });

      return id;
    },
    [currentUser, logActivity, teamMembers],
  );

  const replyToComment = useCallback(
    (parentId: string, content: string): string => {
      const parent = comments.find((c) => c.id === parentId);
      if (!parent) return '';
      const id = generateId('cmt');
      const reply: Comment = {
        id,
        targetType: parent.targetType,
        targetId: parent.targetId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content,
        timestamp: nowISO(),
        resolved: false,
        parentId,
        mentions: [],
        attachments: [],
        reactions: {},
      };
      setComments((prev) => [...prev, reply]);
      logActivity('comment_added', parent.targetId, parent.targetType, `Replied to comment: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`);
      return id;
    },
    [comments, currentUser, logActivity],
  );

  const editComment = useCallback(
    (commentId: string, content: string): void => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId && c.authorId === currentUser.id
            ? { ...c, content, editedAt: nowISO() }
            : c,
        ),
      );
    },
    [currentUser],
  );

  const deleteComment = useCallback(
    (commentId: string): void => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [],
  );

  const resolveComment = useCallback(
    (commentId: string): void => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, resolved: true, resolvedBy: currentUser.name, resolvedAt: nowISO() }
            : c,
        ),
      );
      const comment = comments.find((c) => c.id === commentId);
      if (comment) {
        logActivity('comment_resolved', comment.targetId, comment.targetType, `Resolved comment on ${comment.targetType}`);
      }
    },
    [comments, currentUser, logActivity],
  );

  const unresolveComment = useCallback(
    (commentId: string): void => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, resolved: false, resolvedBy: undefined, resolvedAt: undefined }
            : c,
        ),
      );
    },
    [],
  );

  const addReaction = useCallback(
    (commentId: string, emoji: string): void => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const existing = c.reactions[emoji] || [];
          if (existing.includes(currentUser.id)) return c;
          return {
            ...c,
            reactions: { ...c.reactions, [emoji]: [...existing, currentUser.id] },
          };
        }),
      );
    },
    [currentUser],
  );

  const removeReaction = useCallback(
    (commentId: string, emoji: string): void => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const existing = c.reactions[emoji] || [];
          const filtered = existing.filter((uid) => uid !== currentUser.id);
          const newReactions = { ...c.reactions };
          if (filtered.length === 0) {
            delete newReactions[emoji];
          } else {
            newReactions[emoji] = filtered;
          }
          return { ...c, reactions: newReactions };
        }),
      );
    },
    [currentUser],
  );

  const getCommentsForTarget = useCallback(
    (targetType: CommentTarget, targetId: string): Comment[] => {
      return comments.filter((c) => c.targetType === targetType && c.targetId === targetId);
    },
    [comments],
  );

  const unresolvedCount = useMemo(() => {
    return comments.filter((c) => !c.resolved && !c.parentId).length;
  }, [comments]);

  // ========================================================================
  // APPROVAL WORKFLOWS
  // ========================================================================

  const createWorkflow = useCallback(
    (contentId: string, contentType: string, reviewerIds: string[]): string => {
      const id = generateId('wf');
      const reviewers = reviewerIds
        .map((rid) => {
          const member = teamMembers.find((m) => m.id === rid);
          if (!member) return null;
          return {
            id: member.id,
            name: member.name,
            role: member.role,
            decision: 'pending' as const,
          };
        })
        .filter(Boolean) as ApprovalWorkflow['reviewers'];

      const workflow: ApprovalWorkflow = {
        id,
        contentId,
        contentType,
        status: 'draft',
        requester: { id: currentUser.id, name: currentUser.name },
        reviewers,
        requiredApprovals: reviewers.length,
        currentApprovals: 0,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        stages: [
          { name: 'Draft', status: 'active' },
          { name: 'Review', status: 'pending' },
          { name: 'Approval', status: 'pending' },
          { name: 'Published', status: 'pending' },
        ],
      };
      setWorkflows((prev) => [...prev, workflow]);
      logActivity('status_changed', contentId, contentType, `Created approval workflow for ${contentType}`);
      return id;
    },
    [currentUser, teamMembers, logActivity],
  );

  const submitForReview = useCallback(
    (workflowId: string): void => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            status: 'pending_review' as ApprovalStatus,
            updatedAt: nowISO(),
            stages: w.stages.map((s) => {
              if (s.name === 'Draft') return { ...s, status: 'completed' as const, completedAt: nowISO() };
              if (s.name === 'Review') return { ...s, status: 'active' as const };
              return s;
            }),
          };
        }),
      );
      const wf = workflows.find((w) => w.id === workflowId);
      if (wf) {
        logActivity('review_requested', wf.contentId, wf.contentType, `Submitted ${wf.contentType} for review`);
      }
    },
    [workflows, logActivity],
  );

  const approveContent = useCallback(
    (workflowId: string, feedback?: string): void => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          const updatedReviewers = w.reviewers.map((r) =>
            r.id === currentUser.id
              ? { ...r, decision: 'approved' as const, feedback: feedback || '', decidedAt: nowISO() }
              : r,
          );
          const approvalCount = updatedReviewers.filter((r) => r.decision === 'approved').length;
          const allApproved = approvalCount >= w.requiredApprovals;
          const newStatus: ApprovalStatus = allApproved ? 'approved' : 'in_review';
          const updatedStages = w.stages.map((s) => {
            if (s.name === 'Review' && allApproved) return { ...s, status: 'completed' as const, completedAt: nowISO() };
            if (s.name === 'Approval' && allApproved) return { ...s, status: 'completed' as const, completedAt: nowISO() };
            return s;
          });
          return {
            ...w,
            reviewers: updatedReviewers,
            currentApprovals: approvalCount,
            status: newStatus,
            updatedAt: nowISO(),
            stages: updatedStages,
          };
        }),
      );
      const wf = workflows.find((w) => w.id === workflowId);
      if (wf) {
        logActivity(
          'content_approved',
          wf.contentId,
          wf.contentType,
          `Approved ${wf.contentType}${feedback ? `: "${feedback.slice(0, 60)}"` : ''}`,
        );
      }
    },
    [currentUser, workflows, logActivity],
  );

  const requestChanges = useCallback(
    (workflowId: string, feedback: string): void => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          const updatedReviewers = w.reviewers.map((r) =>
            r.id === currentUser.id
              ? { ...r, decision: 'rejected' as const, feedback, decidedAt: nowISO() }
              : r,
          );
          return {
            ...w,
            reviewers: updatedReviewers,
            status: 'changes_requested' as ApprovalStatus,
            updatedAt: nowISO(),
            stages: w.stages.map((s) => {
              if (s.name === 'Review') return { ...s, status: 'active' as const };
              return s;
            }),
          };
        }),
      );
      const wf = workflows.find((w) => w.id === workflowId);
      if (wf) {
        logActivity('content_rejected', wf.contentId, wf.contentType, `Requested changes on ${wf.contentType}: "${feedback.slice(0, 60)}"`);
      }
    },
    [currentUser, workflows, logActivity],
  );

  const publishContent = useCallback(
    (workflowId: string): void => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          return {
            ...w,
            status: 'published' as ApprovalStatus,
            updatedAt: nowISO(),
            stages: w.stages.map((s) => {
              if (s.status === 'pending' || s.status === 'active') {
                return { ...s, status: 'completed' as const, completedAt: nowISO() };
              }
              return s;
            }),
          };
        }),
      );
      const wf = workflows.find((w) => w.id === workflowId);
      if (wf) {
        logActivity('content_published', wf.contentId, wf.contentType, `Published ${wf.contentType}`);
      }
    },
    [workflows, logActivity],
  );

  const archiveWorkflow = useCallback(
    (workflowId: string): void => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId
            ? { ...w, status: 'archived' as ApprovalStatus, updatedAt: nowISO() }
            : w,
        ),
      );
    },
    [],
  );

  const getWorkflowForContent = useCallback(
    (contentId: string): ApprovalWorkflow | undefined => {
      return workflows.find((w) => w.contentId === contentId && w.status !== 'archived');
    },
    [workflows],
  );

  const pendingReviewCount = useMemo(() => {
    return workflows.filter(
      (w) =>
        (w.status === 'pending_review' || w.status === 'in_review') &&
        w.reviewers.some((r) => r.id === currentUser.id && r.decision === 'pending'),
    ).length;
  }, [workflows, currentUser]);

  // ========================================================================
  // VERSIONS
  // ========================================================================

  const createVersion = useCallback(
    (contentId: string, label: string, snapshot: Record<string, any>, changes: string[] = []): string => {
      const id = generateId('ver');
      const contentVersions = versions.filter((v) => v.contentId === contentId);
      const nextNumber = contentVersions.length > 0 ? Math.max(...contentVersions.map((v) => v.versionNumber)) + 1 : 1;

      // Mark all existing versions as not current
      setVersions((prev) => {
        const updated = prev.map((v) =>
          v.contentId === contentId ? { ...v, isCurrent: false } : v,
        );
        const newVersion: Version = {
          id,
          contentId,
          versionNumber: nextNumber,
          label,
          description: changes.join(', ') || 'New version',
          createdBy: currentUser.name,
          createdAt: nowISO(),
          snapshot,
          changes,
          isCurrent: true,
        };
        return [...updated, newVersion];
      });

      logActivity('version_created', contentId, 'content', `Created version ${label}`);
      return id;
    },
    [versions, currentUser, logActivity],
  );

  const restoreVersion = useCallback(
    (versionId: string): Record<string, any> => {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return {};

      setVersions((prev) =>
        prev.map((v) => {
          if (v.contentId !== version.contentId) return v;
          return { ...v, isCurrent: v.id === versionId };
        }),
      );

      logActivity('version_created', version.contentId, 'content', `Restored to version ${version.label}`);
      return version.snapshot;
    },
    [versions, logActivity],
  );

  const compareVersions = useCallback(
    (v1Id: string, v2Id: string): { added: string[]; removed: string[]; modified: string[] } => {
      const v1 = versions.find((v) => v.id === v1Id);
      const v2 = versions.find((v) => v.id === v2Id);
      if (!v1 || !v2) return { added: [], removed: [], modified: [] };

      const keys1 = new Set(Object.keys(v1.snapshot));
      const keys2 = new Set(Object.keys(v2.snapshot));

      const added: string[] = [];
      const removed: string[] = [];
      const modified: string[] = [];

      keys2.forEach((key) => {
        if (!keys1.has(key)) {
          added.push(key);
        } else if (JSON.stringify(v1.snapshot[key]) !== JSON.stringify(v2.snapshot[key])) {
          modified.push(key);
        }
      });

      keys1.forEach((key) => {
        if (!keys2.has(key)) {
          removed.push(key);
        }
      });

      return { added, removed, modified };
    },
    [versions],
  );

  const getCurrentVersion = useCallback(
    (contentId: string): Version | undefined => {
      return versions.find((v) => v.contentId === contentId && v.isCurrent);
    },
    [versions],
  );

  const getVersionHistory = useCallback(
    (contentId: string): Version[] => {
      return versions
        .filter((v) => v.contentId === contentId)
        .sort((a, b) => b.versionNumber - a.versionNumber);
    },
    [versions],
  );

  // ========================================================================
  // TEAM MEMBERS
  // ========================================================================

  const addTeamMember = useCallback(
    (name: string, email: string, role: TeamRole): string => {
      const id = generateId('user');
      const member: TeamMember = {
        id,
        name,
        email,
        avatar: undefined,
        role,
        assignedContent: [],
        lastActive: nowISO(),
        online: false,
      };
      setTeamMembers((prev) => [...prev, member]);
      logActivity('assignment_changed', id, 'team', `Added ${name} as ${role}`);
      return id;
    },
    [logActivity],
  );

  const removeTeamMember = useCallback(
    (memberId: string): void => {
      const member = teamMembers.find((m) => m.id === memberId);
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (member) {
        logActivity('assignment_changed', memberId, 'team', `Removed ${member.name} from team`);
      }
    },
    [teamMembers, logActivity],
  );

  const updateMemberRole = useCallback(
    (memberId: string, role: TeamRole): void => {
      const member = teamMembers.find((m) => m.id === memberId);
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      if (member) {
        logActivity('assignment_changed', memberId, 'team', `Changed ${member.name}'s role to ${role}`);
      }
    },
    [teamMembers, logActivity],
  );

  const assignContent = useCallback(
    (memberId: string, contentId: string): void => {
      const member = teamMembers.find((m) => m.id === memberId);
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;
          if (m.assignedContent.includes(contentId)) return m;
          return { ...m, assignedContent: [...m.assignedContent, contentId] };
        }),
      );
      if (member) {
        logActivity('assignment_changed', contentId, 'content', `Assigned ${member.name} to content`);
      }
    },
    [teamMembers, logActivity],
  );

  const unassignContent = useCallback(
    (memberId: string, contentId: string): void => {
      const member = teamMembers.find((m) => m.id === memberId);
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;
          return { ...m, assignedContent: m.assignedContent.filter((cid) => cid !== contentId) };
        }),
      );
      if (member) {
        logActivity('assignment_changed', contentId, 'content', `Unassigned ${member.name} from content`);
      }
    },
    [teamMembers, logActivity],
  );

  // ========================================================================
  // ACTIVITY
  // ========================================================================

  const getRecentActivities = useCallback(
    (limit: number = 20): ActivityItem[] => {
      return activities.slice(0, limit);
    },
    [activities],
  );

  const getActivitiesForContent = useCallback(
    (contentId: string): ActivityItem[] => {
      return activities.filter((a) => a.targetId === contentId);
    },
    [activities],
  );

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Comments
    comments,
    addComment,
    replyToComment,
    editComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    addReaction,
    removeReaction,
    getCommentsForTarget,
    unresolvedCount,

    // Approvals
    workflows,
    createWorkflow,
    submitForReview,
    approveContent,
    requestChanges,
    publishContent,
    archiveWorkflow,
    getWorkflowForContent,
    pendingReviewCount,

    // Versions
    versions,
    createVersion,
    restoreVersion,
    compareVersions,
    getCurrentVersion,
    getVersionHistory,

    // Team
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    assignContent,
    unassignContent,

    // Activity
    activities,
    getRecentActivities,
    getActivitiesForContent,

    // Current user
    currentUser,
  };
}
