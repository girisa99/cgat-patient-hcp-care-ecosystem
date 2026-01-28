/**
 * IN-CONTEXT COMMENTING SERVICE (P4-COLLAB-08)
 * 
 * Enables comments on slides, clips, and content elements.
 * Supports threaded replies, resolution, and mentions.
 */

import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  content_id: string;
  content_type: 'slide' | 'clip' | 'element' | 'document' | 'scene';
  element_selector?: string; // CSS selector or element ID for pinned comments
  position?: { x: number; y: number }; // Position for floating comments
  author_id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  mentions: string[]; // User IDs mentioned
  parent_comment_id?: string; // For threaded replies
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentThread {
  rootComment: Comment;
  replies: Comment[];
  replyCount: number;
  isResolved: boolean;
  lastActivity: string;
}

class CommentingService {
  private localComments: Map<string, Comment[]> = new Map();
  private listeners: Map<string, ((comments: Comment[]) => void)[]> = new Map();

  /**
   * Add a new comment to content
   */
  async addComment(params: {
    contentId: string;
    contentType: Comment['content_type'];
    text: string;
    elementSelector?: string;
    position?: { x: number; y: number };
    parentCommentId?: string;
    mentions?: string[];
  }): Promise<Comment> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id || 'anonymous';
    const userEmail = session?.session?.user?.email || 'Anonymous User';

    const comment: Comment = {
      id: crypto.randomUUID(),
      content_id: params.contentId,
      content_type: params.contentType,
      element_selector: params.elementSelector,
      position: params.position,
      author_id: userId,
      author_name: userEmail.split('@')[0],
      text: params.text,
      mentions: params.mentions || this.extractMentions(params.text),
      parent_comment_id: params.parentCommentId,
      is_resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store locally
    const key = `${params.contentType}:${params.contentId}`;
    const existing = this.localComments.get(key) || [];
    existing.push(comment);
    this.localComments.set(key, existing);

    // Notify listeners
    this.notifyListeners(key, existing);

    // Trigger mention notifications
    if (comment.mentions.length > 0) {
      await this.triggerMentionNotifications(comment);
    }

    console.log('💬 Comment added:', comment.id, 'on', params.contentType);
    return comment;
  }

  /**
   * Get all comments for content
   */
  async getComments(contentId: string, contentType: Comment['content_type']): Promise<Comment[]> {
    const key = `${contentType}:${contentId}`;
    return this.localComments.get(key) || [];
  }

  /**
   * Get threaded comments (organized by parent)
   */
  async getThreadedComments(contentId: string, contentType: Comment['content_type']): Promise<CommentThread[]> {
    const comments = await this.getComments(contentId, contentType);
    
    // Group by root comments
    const rootComments = comments.filter(c => !c.parent_comment_id);
    const threads: CommentThread[] = rootComments.map(root => {
      const replies = comments
        .filter(c => c.parent_comment_id === root.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      const allInThread = [root, ...replies];
      const lastActivity = allInThread
        .map(c => c.updated_at)
        .sort()
        .pop() || root.created_at;

      return {
        rootComment: root,
        replies,
        replyCount: replies.length,
        isResolved: root.is_resolved,
        lastActivity,
      };
    });

    // Sort by last activity (newest first)
    return threads.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  /**
   * Reply to a comment
   */
  async replyToComment(parentCommentId: string, text: string): Promise<Comment | null> {
    // Find parent comment
    for (const [key, comments] of this.localComments) {
      const parent = comments.find(c => c.id === parentCommentId);
      if (parent) {
        const [contentType, contentId] = key.split(':');
        return this.addComment({
          contentId,
          contentType: contentType as Comment['content_type'],
          text,
          parentCommentId,
        });
      }
    }
    return null;
  }

  /**
   * Resolve a comment thread
   */
  async resolveComment(commentId: string): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id || 'anonymous';

    for (const [key, comments] of this.localComments) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.is_resolved = true;
        comment.resolved_by = userId;
        comment.resolved_at = new Date().toISOString();
        comment.updated_at = new Date().toISOString();
        
        this.notifyListeners(key, comments);
        console.log('✅ Comment resolved:', commentId);
        return true;
      }
    }
    return false;
  }

  /**
   * Unresolve a comment thread
   */
  async unresolveComment(commentId: string): Promise<boolean> {
    for (const [key, comments] of this.localComments) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.is_resolved = false;
        comment.resolved_by = undefined;
        comment.resolved_at = undefined;
        comment.updated_at = new Date().toISOString();
        
        this.notifyListeners(key, comments);
        console.log('🔄 Comment unresolved:', commentId);
        return true;
      }
    }
    return false;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    for (const [key, comments] of this.localComments) {
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        // Also delete replies
        const toDelete = comments.filter(
          c => c.id === commentId || c.parent_comment_id === commentId
        );
        const remaining = comments.filter(
          c => c.id !== commentId && c.parent_comment_id !== commentId
        );
        
        this.localComments.set(key, remaining);
        this.notifyListeners(key, remaining);
        
        console.log('🗑️ Deleted', toDelete.length, 'comments');
        return true;
      }
    }
    return false;
  }

  /**
   * Edit a comment
   */
  async editComment(commentId: string, newText: string): Promise<boolean> {
    for (const [key, comments] of this.localComments) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.text = newText;
        comment.mentions = this.extractMentions(newText);
        comment.updated_at = new Date().toISOString();
        
        this.notifyListeners(key, comments);
        return true;
      }
    }
    return false;
  }

  /**
   * Subscribe to comment updates
   */
  subscribe(contentId: string, contentType: Comment['content_type'], callback: (comments: Comment[]) => void): () => void {
    const key = `${contentType}:${contentId}`;
    const existing = this.listeners.get(key) || [];
    existing.push(callback);
    this.listeners.set(key, existing);

    // Immediately call with current comments
    const currentComments = this.localComments.get(key) || [];
    callback(currentComments);

    return () => {
      const listeners = this.listeners.get(key) || [];
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.listeners.set(key, listeners);
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
   * Notify all listeners for a content key
   */
  private notifyListeners(key: string, comments: Comment[]) {
    const listeners = this.listeners.get(key) || [];
    listeners.forEach(callback => callback(comments));
  }

  /**
   * Trigger notifications for mentioned users
   */
  private async triggerMentionNotifications(comment: Comment): Promise<void> {
    // This will integrate with the notifications service
    console.log('📢 Triggering notifications for mentions:', comment.mentions);
    // Integration with mentionsNotificationsService handled separately
  }

  /**
   * Get comment count for content
   */
  async getCommentCount(contentId: string, contentType: Comment['content_type']): Promise<{
    total: number;
    unresolved: number;
    resolved: number;
  }> {
    const comments = await this.getComments(contentId, contentType);
    const rootComments = comments.filter(c => !c.parent_comment_id);
    
    return {
      total: rootComments.length,
      unresolved: rootComments.filter(c => !c.is_resolved).length,
      resolved: rootComments.filter(c => c.is_resolved).length,
    };
  }
}

export const commentingService = new CommentingService();
