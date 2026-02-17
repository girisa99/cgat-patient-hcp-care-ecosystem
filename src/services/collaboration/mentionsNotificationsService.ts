/**
 * @MENTIONS & NOTIFICATIONS SERVICE (P4-COLLAB-10)
 * 
 * Handles @mention detection, notification delivery, and user preferences.
 * Integrates with commenting and activity feed systems.
 */

import { supabase } from '@/integrations/supabase/client';
import { activityFeedService } from './activityFeedService';

export type NotificationType = 
  | 'mention'
  | 'reply'
  | 'comment'
  | 'approval_request'
  | 'approval_decision'
  | 'content_shared'
  | 'deadline_reminder'
  | 'system_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  source_user_id?: string;
  source_user_name?: string;
  target_id?: string;
  target_type?: string;
  target_url?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  mentions: boolean;
  replies: boolean;
  comments: boolean;
  approvals: boolean;
  shares: boolean;
  deadlines: boolean;
  systemAlerts: boolean;
  emailDigest: 'none' | 'instant' | 'daily' | 'weekly';
  pushEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
}

export interface MentionSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  recentlyActive: boolean;
}

class MentionsNotificationsService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private listeners: Map<string, ((notifications: Notification[]) => void)[]> = new Map();
  private teamMembers: MentionSuggestion[] = [];

  constructor() {
    // Seed demo team members for suggestions
    this.seedTeamMembers();
  }

  /**
   * Create a notification for a user
   */
  async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    sourceUserId?: string;
    sourceUserName?: string;
    targetId?: string;
    targetType?: string;
    targetUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    // Check user preferences
    const prefs = await this.getPreferences(params.userId);
    if (!this.shouldNotify(params.type, prefs)) {
      console.log('🔕 Notification suppressed by user preferences');
      return null as any;
    }

    const notification: Notification = {
      id: crypto.randomUUID(),
      user_id: params.userId,
      type: params.type,
      priority: params.priority || 'normal',
      title: params.title,
      message: params.message,
      source_user_id: params.sourceUserId,
      source_user_name: params.sourceUserName,
      target_id: params.targetId,
      target_type: params.targetType,
      target_url: params.targetUrl,
      metadata: params.metadata,
      is_read: false,
      is_dismissed: false,
      created_at: new Date().toISOString(),
    };

    // Store notification
    const userNotifications = this.notifications.get(params.userId) || [];
    userNotifications.unshift(notification);
    this.notifications.set(params.userId, userNotifications.slice(0, 100));

    // Notify listeners
    this.notifyListeners(params.userId);

    console.log('🔔 Notification created:', notification.type, 'for user', params.userId);
    return notification;
  }

  /**
   * Create notifications for @mentions in text
   */
  async processMentions(params: {
    text: string;
    sourceUserId: string;
    sourceUserName: string;
    contentId: string;
    contentType: string;
    contentName?: string;
  }): Promise<Notification[]> {
    const mentions = this.extractMentions(params.text);
    const notifications: Notification[] = [];

    for (const mentionName of mentions) {
      const user = this.teamMembers.find(
        m => m.name.toLowerCase() === mentionName.toLowerCase() ||
             m.email.split('@')[0].toLowerCase() === mentionName.toLowerCase()
      );

      if (user && user.id !== params.sourceUserId) {
        const notification = await this.createNotification({
          userId: user.id,
          type: 'mention',
          priority: 'high',
          title: `${params.sourceUserName} mentioned you`,
          message: `You were mentioned in ${params.contentName || params.contentType}`,
          sourceUserId: params.sourceUserId,
          sourceUserName: params.sourceUserName,
          targetId: params.contentId,
          targetType: params.contentType,
          targetUrl: `/${params.contentType}/${params.contentId}`,
          metadata: { mentionText: params.text.substring(0, 200) },
        });
        if (notification) {
          notifications.push(notification);
        }
      }
    }

    // Log activity
    if (mentions.length > 0) {
      await activityFeedService.logActivity({
        type: 'comment_added',
        targetId: params.contentId,
        targetType: params.contentType,
        targetName: params.contentName,
        description: `Mentioned ${mentions.map(m => '@' + m).join(', ')}`,
        metadata: { mentions },
      });
    }

    return notifications;
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    types?: NotificationType[];
    limit?: number;
  }): Promise<Notification[]> {
    let notifications = this.notifications.get(userId) || [];

    if (options?.unreadOnly) {
      notifications = notifications.filter(n => !n.is_read);
    }

    if (options?.types?.length) {
      notifications = notifications.filter(n => options.types!.includes(n.type));
    }

    return notifications.slice(0, options?.limit || 50);
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter(n => !n.is_read && !n.is_dismissed).length;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.is_read = true;
      notification.read_at = new Date().toISOString();
      this.notifyListeners(userId);
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId) || [];
    let count = 0;
    
    notifications.forEach(n => {
      if (!n.is_read) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
        count++;
      }
    });
    
    this.notifyListeners(userId);
    return count;
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId: string, userId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.is_dismissed = true;
      this.notifyListeners(userId);
      return true;
    }
    return false;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.preferences.get(userId) || {
      mentions: true,
      replies: true,
      comments: true,
      approvals: true,
      shares: true,
      deadlines: true,
      systemAlerts: true,
      emailDigest: 'daily',
      pushEnabled: true,
    };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...updates };
    this.preferences.set(userId, updated);
    console.log('⚙️ Preferences updated for user:', userId);
    return updated;
  }

  /**
   * Get mention suggestions
   */
  async getMentionSuggestions(query: string, limit: number = 5): Promise<MentionSuggestion[]> {
    const lowerQuery = query.toLowerCase();
    
    return this.teamMembers
      .filter(m => 
        m.name.toLowerCase().includes(lowerQuery) ||
        m.email.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        // Prioritize recently active users
        if (a.recentlyActive !== b.recentlyActive) {
          return a.recentlyActive ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const existing = this.listeners.get(userId) || [];
    existing.push(callback);
    this.listeners.set(userId, existing);

    // Immediately call with current notifications
    callback(this.notifications.get(userId) || []);

    return () => {
      const listeners = this.listeners.get(userId) || [];
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.listeners.set(userId, listeners);
      }
    };
  }

  /**
   * Extract @mentions from text
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = text.matchAll(mentionRegex);
    return Array.from(matches, m => m[1]);
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldNotify(type: NotificationType, prefs: NotificationPreferences): boolean {
    const typeMap: Record<NotificationType, keyof NotificationPreferences> = {
      mention: 'mentions',
      reply: 'replies',
      comment: 'comments',
      approval_request: 'approvals',
      approval_decision: 'approvals',
      content_shared: 'shares',
      deadline_reminder: 'deadlines',
      system_alert: 'systemAlerts',
    };

    const prefKey = typeMap[type];
    return prefKey ? prefs[prefKey] as boolean : true;
  }

  /**
   * Notify listeners for a user
   */
  private notifyListeners(userId: string) {
    const listeners = this.listeners.get(userId) || [];
    const notifications = this.notifications.get(userId) || [];
    listeners.forEach(callback => callback(notifications));
  }

  /**
   * Seed demo team members
   */
  private seedTeamMembers() {
    this.teamMembers = [
      { id: 'user-1', name: 'Alex Chen', email: 'alex@example.com', role: 'Admin', recentlyActive: true },
      { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Editor', recentlyActive: true },
      { id: 'user-3', name: 'Mike Williams', email: 'mike@example.com', role: 'Viewer', recentlyActive: false },
      { id: 'user-4', name: 'Emma Davis', email: 'emma@example.com', role: 'Editor', recentlyActive: true },
      { id: 'user-5', name: 'James Brown', email: 'james@example.com', role: 'Admin', recentlyActive: false },
    ];
  }

  /**
   * Get notification type metadata
   */
  getNotificationMeta(type: NotificationType): { icon: string; color: string } {
    const meta: Record<NotificationType, { icon: string; color: string }> = {
      mention: { icon: 'AtSign', color: 'blue' },
      reply: { icon: 'Reply', color: 'purple' },
      comment: { icon: 'MessageSquare', color: 'orange' },
      approval_request: { icon: 'Clock', color: 'yellow' },
      approval_decision: { icon: 'CheckCircle', color: 'green' },
      content_shared: { icon: 'Share2', color: 'blue' },
      deadline_reminder: { icon: 'Bell', color: 'red' },
      system_alert: { icon: 'AlertCircle', color: 'gray' },
    };
    return meta[type] || { icon: 'Bell', color: 'gray' };
  }
}

export const mentionsNotificationsService = new MentionsNotificationsService();
