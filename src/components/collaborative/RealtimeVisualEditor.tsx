import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MousePointer, 
  Edit3, 
  Eye, 
  MessageCircle,
  Share2,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor: { x: number; y: number };
  isActive: boolean;
  currentAction?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  position: { x: number; y: number };
  timestamp: Date;
  resolved: boolean;
}

interface RealtimeVisualEditorProps {
  sessionId: string;
  workflowId?: string;
  isReadOnly?: boolean;
}

export const RealtimeVisualEditor: React.FC<RealtimeVisualEditorProps> = ({
  sessionId,
  workflowId,
  isReadOnly = false
}) => {
  const { collaborators, isConnected, broadcastWorkflowChange, updatePresence } = useRealtimeCollaboration(sessionId);
  
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);

  // Mock collaborators for demo
  const [mockCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/api/placeholder/32/32',
      color: '#3B82F6',
      cursor: { x: 200, y: 150 },
      isActive: true,
      currentAction: 'Editing Node Properties'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      avatar: '/api/placeholder/32/32',
      color: '#10B981',
      cursor: { x: 400, y: 300 },
      isActive: true,
      currentAction: 'Adding Connection'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: '/api/placeholder/32/32',
      color: '#F59E0B',
      cursor: { x: 150, y: 250 },
      isActive: false
    }
  ]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const newCursor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    setLocalCursor(newCursor);
    
    // Update presence for other collaborators
    updatePresence({
      user_id: 'current-user',
      cursor_position: newCursor,
      active_component: selectedElement || 'canvas',
      last_activity: new Date().toISOString()
    });
  }, [selectedElement, updatePresence]);

  // Handle element selection
  const handleElementClick = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
    
    // Broadcast selection change
    broadcastWorkflowChange({
      type: 'node_updated',
      data: { elementId }
    });
  }, [broadcastWorkflowChange]);

  // Handle commenting
  const handleAddComment = useCallback((event: React.MouseEvent) => {
    if (event.altKey) { // Alt + click to add comment
      const rect = event.currentTarget.getBoundingClientRect();
      setCommentPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, []);

  const submitComment = useCallback(() => {
    if (newComment.trim() && commentPosition) {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'You',
        content: newComment.trim(),
        position: commentPosition,
        timestamp: new Date(),
        resolved: false
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setCommentPosition(null);
      
      // Broadcast comment
      broadcastWorkflowChange({
        type: 'chat_message',
        data: comment
      });
    }
  }, [newComment, commentPosition, broadcastWorkflowChange]);

  // Mock workflow elements
  const workflowElements = [
    { id: 'node-1', type: 'input', position: { x: 100, y: 100 }, title: 'Start Node' },
    { id: 'node-2', type: 'process', position: { x: 300, y: 100 }, title: 'Process Data' },
    { id: 'node-3', type: 'decision', position: { x: 500, y: 100 }, title: 'Validate' },
    { id: 'node-4', type: 'output', position: { x: 700, y: 100 }, title: 'End Node' }
  ];

  return (
    <div className="w-full h-full space-y-4">
      {/* Collaboration Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Real-time Collaboration
              <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Comments ({comments.filter(c => !c.resolved).length})
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              {isReadOnly ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Read Only
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  Editor
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Active Collaborators */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Active collaborators:</span>
            <div className="flex items-center gap-2">
              {mockCollaborators.filter(c => c.isActive).map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border-2" style={{ borderColor: collaborator.color }}>
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs">
                    <div className="font-medium">{collaborator.name}</div>
                    {collaborator.currentAction && (
                      <div className="text-muted-foreground">{collaborator.currentAction}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Editor Canvas */}
      <Card className="flex-1">
        <CardContent className="p-0">
          <div 
            className="relative w-full h-96 bg-gradient-to-br from-background to-muted/20 overflow-hidden"
            onMouseMove={handleMouseMove}
            onClick={handleAddComment}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Workflow Elements */}
            {workflowElements.map((element) => (
              <motion.div
                key={element.id}
                className={`absolute w-24 h-16 rounded-lg border-2 bg-card cursor-pointer transition-all ${
                  selectedElement === element.id 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y
                }}
                onClick={(e) => handleElementClick(element.id, e)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 text-center">
                  <div className="text-xs font-medium truncate">{element.title}</div>
                  <div className="text-xs text-muted-foreground">{element.type}</div>
                </div>
                
                {/* Selection indicator */}
                {selectedElement === element.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                  />
                )}
              </motion.div>
            ))}

            {/* Collaborator Cursors */}
            <AnimatePresence>
              {mockCollaborators.filter(c => c.isActive).map((collaborator) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: collaborator.cursor.x,
                    top: collaborator.cursor.y,
                    transform: 'translate(-2px, -2px)'
                  }}
                >
                  <MousePointer 
                    className="h-4 w-4" 
                    style={{ color: collaborator.color }}
                  />
                  <div 
                    className="ml-2 mt-1 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.name}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Comments */}
            <AnimatePresence>
              {showComments && comments.filter(c => !c.resolved).map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute z-30"
                  style={{
                    left: comment.position.x,
                    top: comment.position.y
                  }}
                >
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 shadow-lg max-w-48">
                    <div className="text-xs font-medium text-yellow-800">{comment.userName}</div>
                    <div className="text-xs text-yellow-700 mt-1">{comment.content}</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {comment.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full absolute -bottom-1 left-2" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Comment Input */}
            <AnimatePresence>
              {commentPosition && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute z-40 bg-card border rounded-lg p-3 shadow-lg"
                  style={{
                    left: commentPosition.x,
                    top: commentPosition.y,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="space-y-2 w-48">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitComment();
                        if (e.key === 'Escape') setCommentPosition(null);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={submitComment}>
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCommentPosition(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Your Cursor */}
            <div 
              className="absolute pointer-events-none z-10"
              style={{
                left: localCursor.x,
                top: localCursor.y,
                transform: 'translate(-2px, -2px)'
              }}
            >
              <MousePointer className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Element Properties
                {isEditing && <Badge variant="secondary">Live Editing</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Element ID</label>
                  <Input value={selectedElement} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input value="Process Node" disabled />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input 
                  placeholder="Node title"
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  onChange={(e) => {
                    // Broadcast property change
                    broadcastWorkflowChange({
                      type: 'property_changed',
                      data: { 
                        elementId: selectedElement, 
                        property: 'title', 
                        value: e.target.value 
                      }
                    });
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                💡 Alt + Click anywhere to add a comment
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};