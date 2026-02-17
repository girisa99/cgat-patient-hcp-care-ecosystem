/**
 * COLLABORATION SERVICES INDEX (P4-COLLAB)
 * 
 * Central export for all collaboration services.
 * 
 * Completed Scenarios:
 * - P4-COLLAB-01: Shared Workspaces ✅
 * - P4-COLLAB-02: Team Invitations ✅
 * - P4-COLLAB-03: Role-Based Access Control ✅
 * - P4-COLLAB-04: Real-Time Presence Indicators ✅
 * - P4-COLLAB-05: Live Cursor Tracking ✅
 * - P4-COLLAB-06: Approval Workflows ✅
 * - P4-COLLAB-07: Edit Conflict Resolution ✅
 * - P4-COLLAB-08: In-Context Commenting ✅ (NEW)
 * - P4-COLLAB-09: Team Activity Feed ✅ (NEW)
 * - P4-COLLAB-10: @Mentions & Notifications ✅ (NEW)
 */

// Approval Workflow (P4-COLLAB-06)
export {
  approvalWorkflowService,
  type ApprovalStatus,
  type ApprovalPriority,
  type ApprovalRequest,
  type ApprovalStep,
  type ApprovalRule,
  type ApprovalCondition,
  type ApprovalStepTemplate,
  type ApprovalNotification,
} from './approvalWorkflowService';

// Commenting System (P4-COLLAB-08)
export { 
  commentingService,
  type Comment,
  type CommentThread,
} from './commentingService';

// Activity Feed (P4-COLLAB-09)
export { 
  activityFeedService,
  type ActivityEvent,
  type ActivityType,
  type ActivityFilter,
  type ActivityStats,
} from './activityFeedService';

// Mentions & Notifications (P4-COLLAB-10)
export { 
  mentionsNotificationsService,
  type Notification,
  type NotificationType,
  type NotificationPriority,
  type NotificationPreferences,
  type MentionSuggestion,
} from './mentionsNotificationsService';
