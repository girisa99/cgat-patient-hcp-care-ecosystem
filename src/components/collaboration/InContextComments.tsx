/**
 * IN-CONTEXT COMMENTING UI (P4-COLLAB-08)
 * 
 * Displays and manages comments on content elements.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  RotateCcw, 
  Reply, 
  MoreHorizontal,
  Trash2 
} from 'lucide-react';
import { commentingService, Comment, CommentThread } from '@/services/collaboration/commentingService';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InContextCommentsProps {
  contentId: string;
  contentType: Comment['content_type'];
  elementSelector?: string;
  onCommentCountChange?: (count: number) => void;
}

export const InContextComments: React.FC<InContextCommentsProps> = ({
  contentId,
  contentType,
  elementSelector,
  onCommentCountChange,
}) => {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadComments();
    const unsubscribe = commentingService.subscribe(contentId, contentType, () => {
      loadComments();
    });
    return unsubscribe;
  }, [contentId, contentType]);

  const loadComments = async () => {
    const threadedComments = await commentingService.getThreadedComments(contentId, contentType);
    setThreads(threadedComments);
    const count = await commentingService.getCommentCount(contentId, contentType);
    onCommentCountChange?.(count.total);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await commentingService.addComment({
        contentId,
        contentType,
        text: newComment,
        elementSelector,
      });
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await commentingService.replyToComment(parentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    await commentingService.resolveComment(commentId);
  };

  const handleUnresolve = async (commentId: string) => {
    await commentingService.unresolveComment(commentId);
  };

  const handleDelete = async (commentId: string) => {
    await commentingService.deleteComment(commentId);
  };

  const filteredThreads = showResolved 
    ? threads 
    : threads.filter(t => !t.isResolved);

  const resolvedCount = threads.filter(t => t.isResolved).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({threads.length})
          </CardTitle>
          {resolvedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
              className="text-xs"
            >
              {showResolved ? 'Hide' : 'Show'} resolved ({resolvedCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment... Use @name to mention teammates"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-3 w-3 mr-1" />
              Comment
            </Button>
          </div>
        </div>

        {/* Comment Threads */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {filteredThreads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
            
            {filteredThreads.map((thread) => (
              <div 
                key={thread.rootComment.id} 
                className={`p-3 rounded-lg border ${thread.isResolved ? 'bg-muted/50 opacity-75' : 'bg-background'}`}
              >
                {/* Root Comment */}
                <CommentItem
                  comment={thread.rootComment}
                  onReply={() => setReplyingTo(thread.rootComment.id)}
                  onResolve={() => handleResolve(thread.rootComment.id)}
                  onUnresolve={() => handleUnresolve(thread.rootComment.id)}
                  onDelete={() => handleDelete(thread.rootComment.id)}
                  isResolved={thread.isResolved}
                />

                {/* Replies */}
                {thread.replies.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-muted pl-3">
                    {thread.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply
                        onDelete={() => handleDelete(reply.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === thread.rootComment.id && (
                  <div className="ml-6 mt-3 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[60px] text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(thread.rootComment.id)}
                        disabled={!replyText.trim() || isSubmitting}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  isResolved?: boolean;
  onReply?: () => void;
  onResolve?: () => void;
  onUnresolve?: () => void;
  onDelete?: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isReply,
  isResolved,
  onReply,
  onResolve,
  onUnresolve,
  onDelete,
}) => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">
          {comment.author_name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.author_name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {isResolved && (
            <Badge variant="outline" className="text-xs text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
        
        {/* Mentioned users */}
        {comment.mentions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {comment.mentions.map((mention) => (
              <Badge key={mention} variant="secondary" className="text-xs">
                @{mention}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {!isReply && onReply && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onReply}>
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover z-50">
              {!isReply && !isResolved && onResolve && (
                <DropdownMenuItem onClick={onResolve}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as resolved
                </DropdownMenuItem>
              )}
              {!isReply && isResolved && onUnresolve && (
                <DropdownMenuItem onClick={onUnresolve}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reopen
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default InContextComments;
