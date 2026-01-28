/**
 * TEAM ACTIVITY FEED SERVICE (P4-COLLAB-09)
 * 
 * Tracks and displays recent changes, actions, and events across the team.
 * Provides a timeline of all collaborative activities.
 */

import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 
  | 'content_created'
  | 'content_updated'
  | 'content_deleted'
  | 'content_published'
  | 'comment_added'
  | 'comment_resolved'
  | 'member_joined'
  | 'member_left'
  | 'version_created'
  | 'version_restored'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_rejected'
  | 'asset_uploaded'
  | 'generation_completed'
  | 'generation_failed'
  | 'settings_changed'
  | 'export_completed';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  workspace_id?: string;
  target_id?: string;
  target_type?: string;
  target_name?: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  is_read: boolean;
}

export interface ActivityFilter {
  types?: ActivityType[];
  actorId?: string;
  workspaceId?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface ActivityStats {
  totalToday: number;
  byType: Record<ActivityType, number>;
  byActor: { actorId: string; actorName: string; count: number }[];
  peakHour: number;
}

class ActivityFeedService {
  private activities: ActivityEvent[] = [];
  private listeners: ((activities: ActivityEvent[]) => void)[] = [];
  private maxActivities = 500;

  /**
   * Log a new activity event
   */
  async logActivity(params: {
    type: ActivityType;
    targetId?: string;
    targetType?: string;
    targetName?: string;
    description: string;
    metadata?: Record<string, any>;
    workspaceId?: string;
  }): Promise<ActivityEvent> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id || 'system';
    const userEmail = session?.session?.user?.email || 'System';

    const activity: ActivityEvent = {
      id: crypto.randomUUID(),
      type: params.type,
      actor_id: userId,
      actor_name: userEmail.split('@')[0],
      workspace_id: params.workspaceId,
      target_id: params.targetId,
      target_type: params.targetType,
      target_name: params.targetName,
      description: params.description,
      metadata: params.metadata,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    // Add to beginning of array
    this.activities.unshift(activity);

    // Trim to max size
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }

    // Notify listeners
    this.notifyListeners();

    console.log('📝 Activity logged:', activity.type, activity.description);
    return activity;
  }

  /**
   * Get activity feed with optional filtering
   */
  async getActivities(filter?: ActivityFilter): Promise<ActivityEvent[]> {
    let filtered = [...this.activities];

    if (filter?.types?.length) {
      filtered = filtered.filter(a => filter.types!.includes(a.type));
    }

    if (filter?.actorId) {
      filtered = filtered.filter(a => a.actor_id === filter.actorId);
    }

    if (filter?.workspaceId) {
      filtered = filtered.filter(a => a.workspace_id === filter.workspaceId);
    }

    if (filter?.targetType) {
      filtered = filtered.filter(a => a.target_type === filter.targetType);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(a => new Date(a.created_at) >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(a => new Date(a.created_at) <= filter.endDate!);
    }

    const limit = filter?.limit || 50;
    return filtered.slice(0, limit);
  }

  /**
   * Get grouped activities by date
   */
  async getGroupedActivities(filter?: ActivityFilter): Promise<Map<string, ActivityEvent[]>> {
    const activities = await this.getActivities(filter);
    const grouped = new Map<string, ActivityEvent[]>();

    activities.forEach(activity => {
      const date = new Date(activity.created_at).toLocaleDateString();
      const existing = grouped.get(date) || [];
      existing.push(activity);
      grouped.set(date, existing);
    });

    return grouped;
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(workspaceId?: string): Promise<ActivityStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = this.activities.filter(a => {
      const activityDate = new Date(a.created_at);
      return activityDate >= today && (!workspaceId || a.workspace_id === workspaceId);
    });

    // Count by type
    const byType: Record<ActivityType, number> = {} as Record<ActivityType, number>;
    todayActivities.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    // Count by actor
    const actorCounts = new Map<string, { name: string; count: number }>();
    todayActivities.forEach(a => {
      const existing = actorCounts.get(a.actor_id) || { name: a.actor_name, count: 0 };
      existing.count++;
      actorCounts.set(a.actor_id, existing);
    });

    const byActor = Array.from(actorCounts.entries())
      .map(([actorId, data]) => ({ actorId, actorName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);

    // Find peak hour
    const hourCounts = new Array(24).fill(0);
    todayActivities.forEach(a => {
      const hour = new Date(a.created_at).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      totalToday: todayActivities.length,
      byType,
      byActor,
      peakHour,
    };
  }

  /**
   * Mark activity as read
   */
  async markAsRead(activityId: string): Promise<boolean> {
    const activity = this.activities.find(a => a.id === activityId);
    if (activity) {
      activity.is_read = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Mark all activities as read
   */
  async markAllAsRead(): Promise<number> {
    let count = 0;
    this.activities.forEach(a => {
      if (!a.is_read) {
        a.is_read = true;
        count++;
      }
    });
    this.notifyListeners();
    return count;
  }

  /**
   * Get unread count
   */
  getUnreadCount(workspaceId?: string): number {
    return this.activities.filter(a => 
      !a.is_read && (!workspaceId || a.workspace_id === workspaceId)
    ).length;
  }

  /**
   * Subscribe to activity updates
   */
  subscribe(callback: (activities: ActivityEvent[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.activities);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.activities));
  }

  /**
   * Get activity type icon and color
   */
  getActivityMeta(type: ActivityType): { icon: string; color: string; label: string } {
    const meta: Record<ActivityType, { icon: string; color: string; label: string }> = {
      content_created: { icon: 'Plus', color: 'green', label: 'Created' },
      content_updated: { icon: 'Edit2', color: 'blue', label: 'Updated' },
      content_deleted: { icon: 'Trash2', color: 'red', label: 'Deleted' },
      content_published: { icon: 'Globe', color: 'purple', label: 'Published' },
      comment_added: { icon: 'MessageSquare', color: 'orange', label: 'Commented' },
      comment_resolved: { icon: 'CheckCircle', color: 'green', label: 'Resolved' },
      member_joined: { icon: 'UserPlus', color: 'green', label: 'Joined' },
      member_left: { icon: 'UserMinus', color: 'gray', label: 'Left' },
      version_created: { icon: 'GitBranch', color: 'blue', label: 'Version' },
      version_restored: { icon: 'RotateCcw', color: 'orange', label: 'Restored' },
      approval_requested: { icon: 'Clock', color: 'yellow', label: 'Requested' },
      approval_granted: { icon: 'Check', color: 'green', label: 'Approved' },
      approval_rejected: { icon: 'X', color: 'red', label: 'Rejected' },
      asset_uploaded: { icon: 'Upload', color: 'blue', label: 'Uploaded' },
      generation_completed: { icon: 'Sparkles', color: 'purple', label: 'Generated' },
      generation_failed: { icon: 'AlertTriangle', color: 'red', label: 'Failed' },
      settings_changed: { icon: 'Settings', color: 'gray', label: 'Settings' },
      export_completed: { icon: 'Download', color: 'green', label: 'Exported' },
    };
    return meta[type] || { icon: 'Activity', color: 'gray', label: type };
  }

  /**
   * Seed demo activities for testing
   */
  seedDemoActivities(): void {
    const demoActivities: Partial<ActivityEvent>[] = [
      { type: 'content_created', description: 'Created "Q1 Marketing Video"', target_name: 'Q1 Marketing Video' },
      { type: 'comment_added', description: 'Commented on slide 3', target_name: 'Slide 3' },
      { type: 'generation_completed', description: 'AI generated 5 slides', metadata: { slides: 5 } },
      { type: 'member_joined', description: 'Sarah joined the workspace' },
      { type: 'approval_granted', description: 'Approved "Product Demo"', target_name: 'Product Demo' },
      { type: 'version_created', description: 'Created version 2.0', target_name: 'Brand Guidelines' },
    ];

    demoActivities.forEach((demo, index) => {
      const activity: ActivityEvent = {
        id: crypto.randomUUID(),
        type: demo.type!,
        actor_id: `demo-user-${index % 3}`,
        actor_name: ['Alex', 'Sarah', 'Mike'][index % 3],
        description: demo.description!,
        target_id: demo.target_name,
        target_type: 'content',
        target_name: demo.target_name,
        metadata: demo.metadata,
        created_at: new Date(Date.now() - index * 3600000).toISOString(),
        is_read: index > 2,
      };
      this.activities.push(activity);
    });

    this.notifyListeners();
  }
}

export const activityFeedService = new ActivityFeedService();
