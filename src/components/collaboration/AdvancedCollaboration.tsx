import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from 'sonner';
import {
  Users,
  MessageCircle,
  Video,
  Share2,
  MousePointer,
  Edit3,
  Eye,
  Wifi,
  WifiOff,
  Send,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AdvancedCollaborationProps {
  sessionId: string;
  onWorkflowChange?: (change: any) => void;
}

export const AdvancedCollaboration: React.FC<AdvancedCollaborationProps> = ({
  sessionId,
  onWorkflowChange
}) => {
  const { user } = useMasterAuth();
  const { 
    collaborators, 
    isConnected, 
    broadcastWorkflowChange, 
    updatePresence 
  } = useRealtimeCollaboration(sessionId);
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [conflictResolution, setConflictResolution] = useState<any[]>([]);

  // Update presence with cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setCursorPosition(newPos);
      
      if (isConnected && user) {
        updatePresence({
          user_id: user.id,
          cursor_position: newPos,
          active_component: 'workflow-builder',
          last_activity: new Date().toISOString()
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isConnected, user, updatePresence]);

  // Handle workflow changes and conflict detection
  const handleWorkflowChange = useCallback((change: any) => {
    // Broadcast change to other collaborators
    if (isConnected) {
      broadcastWorkflowChange({
        type: change.type,
        data: change.data,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      });
    }

    // Check for conflicts
    const potentialConflicts = collaborators.filter(
      collab => collab.active_component === change.component &&
      collab.user_id !== user?.id &&
      Date.now() - new Date(collab.last_activity).getTime() < 5000 // Active in last 5 seconds
    );

    if (potentialConflicts.length > 0) {
      setConflictResolution(prev => [...prev, {
        id: Date.now(),
        type: 'concurrent_edit',
        component: change.component,
        users: potentialConflicts.map(c => c.name),
        timestamp: new Date().toISOString()
      }]);
    }

    onWorkflowChange?.(change);
  }, [isConnected, broadcastWorkflowChange, collaborators, user, onWorkflowChange]);

  // Send chat message
  const sendChatMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message = {
      id: Date.now(),
      user_id: user.id,
      user_name: user.email || 'Anonymous',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Broadcast to other collaborators
    if (isConnected) {
      broadcastWorkflowChange({
        type: 'chat_message',
        data: message,
        user_id: user.id,
        timestamp: message.timestamp
      });
    }
  };

  // Real-time cursor tracking for other users
  const CollaboratorCursors = () => (
    <>
      {collaborators
        .filter(collab => collab.user_id !== user?.id && collab.cursor_position)
        .map((collab) => (
          <motion.div
            key={collab.user_id}
            className="fixed pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: collab.cursor_position.x,
              y: collab.cursor_position.y
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center gap-1">
              <MousePointer 
                className="w-4 h-4 text-primary" 
                style={{ 
                  filter: `hue-rotate(${collab.user_id.slice(-2) === user?.id.slice(-2) ? 0 : Math.abs(collab.user_id.charCodeAt(0) - (user?.id.charCodeAt(0) || 0)) * 30}deg)`
                }}
              />
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                {collab.name}
              </div>
            </div>
          </motion.div>
        ))}
    </>
  );

  // Conflict Resolution Modal
  const ConflictResolutionModal = () => (
    <AnimatePresence>
      {conflictResolution.length > 0 && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Merge Conflict Detected</h3>
            </div>
            
            {conflictResolution.map((conflict) => (
              <div key={conflict.id} className="mb-4 p-3 bg-muted rounded">
                <p className="text-sm">
                  Multiple users are editing the same component: <strong>{conflict.component}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users: {conflict.users.join(', ')}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => {
                    setConflictResolution(prev => prev.filter(c => c.id !== conflict.id));
                    toast.success('Conflict resolved - keeping your changes');
                  }}>
                    Keep My Changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setConflictResolution(prev => prev.filter(c => c.id !== conflict.id));
                    toast.info('Conflict resolved - merged changes');
                  }}>
                    Merge Changes
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <TooltipProvider>
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {/* Connection Status */}
        <Card className="w-80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {collaborators.length} online
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowChat(!showChat)}
                  className="h-8 w-8 p-0"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Video className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Collaborators */}
        <Card className="w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <motion.div
                  key={collaborator.user_id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={collaborator.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{collaborator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {collaborator.active_component || 'Viewing'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {collaborator.user_id === user?.id ? (
                      <Edit3 className="w-3 h-3 text-green-500" />
                    ) : (
                      <Eye className="w-3 h-3 text-blue-500" />
                    )}
                    <Tooltip>
                      <TooltipTrigger>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Last active: {new Date(collaborator.last_activity).toLocaleTimeString()}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              ))}
              
              {collaborators.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No other collaborators online
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 300 }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="w-80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Team Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ScrollArea className="h-40 mb-3">
                    <div className="space-y-2">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">{message.user_name}</span>
                            <span className="text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendChatMessage();
                        }
                      }}
                    />
                    <Button size="sm" onClick={sendChatMessage}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Cursors */}
      <CollaboratorCursors />
      
      {/* Conflict Resolution */}
      <ConflictResolutionModal />
    </TooltipProvider>
  );
};

export default AdvancedCollaboration;