/**
 * Real-time Collaborative Editor
 * Enhanced collaborative editing with conflict resolution and synchronized workflows
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Eye, 
  Edit, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Lock,
  Unlock,
  GitBranch,
  GitMerge,
  History,
  Share2,
  Bell
} from 'lucide-react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { supabase } from '@/integrations/supabase/client';

interface CollaborativeChange {
  id: string;
  type: 'node_added' | 'node_removed' | 'node_updated' | 'connection_added' | 'connection_removed' | 'chat_message' | 'property_changed';
  elementId: string;
  userId: string;
  userName: string;
  timestamp: string;
  data: any;
  conflictsWith?: string[];
  isResolved?: boolean;
}

interface VersionSnapshot {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  changes: CollaborativeChange[];
  workflowState: any;
  message?: string;
}

interface ConflictResolution {
  changeId: string;
  strategy: 'accept_local' | 'accept_remote' | 'merge' | 'manual';
  mergedData?: any;
}

interface RealtimeCollaborativeEditorProps {
  sessionId: string;
  workflowData: any;
  onWorkflowUpdate: (data: any) => void;
  isReadOnly?: boolean;
}

export const RealtimeCollaborativeEditor: React.FC<RealtimeCollaborativeEditorProps> = ({
  sessionId,
  workflowData,
  onWorkflowUpdate,
  isReadOnly = false
}) => {
  const { toast } = useToast();
  const { nodeTypes } = useWorkflowNodes();
  const { 
    collaborators, 
    isConnected, 
    broadcastWorkflowChange, 
    updatePresence 
  } = useRealtimeCollaboration(sessionId);

  const [changes, setChanges] = useState<CollaborativeChange[]>([]);
  const [conflicts, setConflicts] = useState<CollaborativeChange[]>([]);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [lockedElements, setLockedElements] = useState<Map<string, string>>(new Map());
  const [isLockingEnabled, setIsLockingEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30000); // 30 seconds
  const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date());
  
  const workflowStateRef = useRef(workflowData);
  const changeBufferRef = useRef<CollaborativeChange[]>([]);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Handle incoming workflow changes
  useEffect(() => {
    const handleWorkflowChange = (event: CustomEvent) => {
      const change = event.detail as CollaborativeChange;
      processIncomingChange(change);
    };

    window.addEventListener('workflow_change', handleWorkflowChange as EventListener);
    return () => {
      window.removeEventListener('workflow_change', handleWorkflowChange as EventListener);
    };
  }, []);

  // Auto-save mechanism
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (changeBufferRef.current.length > 0) {
        saveVersionSnapshot('Auto-save');
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveInterval]);

  // Update presence when cursor moves or elements are selected
  const handleCursorMove = useCallback((position: { x: number; y: number }) => {
    updatePresence({
      cursor_position: position,
      last_activity: new Date().toISOString()
    });
  }, [updatePresence]);

  const handleElementSelection = useCallback((elementIds: string[]) => {
    setSelectedElements(new Set(elementIds));
    updatePresence({
      active_component: elementIds.length > 0 ? elementIds[0] : undefined,
      last_activity: new Date().toISOString()
    });
  }, [updatePresence]);

  // Process incoming changes from other users
  const processIncomingChange = useCallback((change: CollaborativeChange) => {
    const currentState = workflowStateRef.current;
    const hasConflict = detectConflict(change, currentState);
    
    if (hasConflict) {
      setConflicts(prev => [...prev, change]);
      toast({
        title: "Conflict Detected",
        description: `Change by ${change.userName} conflicts with your local changes`,
        variant: "destructive",
      });
    } else {
      applyChange(change);
      setChanges(prev => [...prev, change]);
    }
  }, [toast]);

  // Detect conflicts between incoming changes and local state
  const detectConflict = (incomingChange: CollaborativeChange, currentState: any): boolean => {
    // Check if the same element is being modified
    const isElementLocked = lockedElements.has(incomingChange.elementId);
    
    // Check if there are recent local changes to the same element
    const recentLocalChanges = changeBufferRef.current.filter(
      change => change.elementId === incomingChange.elementId &&
      new Date(incomingChange.timestamp).getTime() - new Date(change.timestamp).getTime() < 5000 // 5 seconds
    );

    return isElementLocked || recentLocalChanges.length > 0;
  };

  // Apply a change to the workflow
  const applyChange = useCallback((change: CollaborativeChange) => {
    let newWorkflowData = { ...workflowStateRef.current };

    switch (change.type) {
      case 'node_added':
        newWorkflowData.nodes = [...(newWorkflowData.nodes || []), change.data];
        break;
      case 'node_removed':
        newWorkflowData.nodes = (newWorkflowData.nodes || []).filter(
          (node: any) => node.id !== change.elementId
        );
        break;
      case 'node_updated':
        newWorkflowData.nodes = (newWorkflowData.nodes || []).map(
          (node: any) => node.id === change.elementId ? { ...node, ...change.data } : node
        );
        break;
      case 'connection_added':
        newWorkflowData.edges = [...(newWorkflowData.edges || []), change.data];
        break;
      case 'connection_removed':
        newWorkflowData.edges = (newWorkflowData.edges || []).filter(
          (edge: any) => edge.id !== change.elementId
        );
        break;
      case 'property_changed':
        // Apply property changes to specific elements
        if (newWorkflowData.nodes) {
          newWorkflowData.nodes = newWorkflowData.nodes.map((node: any) => 
            node.id === change.elementId 
              ? { ...node, data: { ...node.data, ...change.data } }
              : node
          );
        }
        break;
    }

    workflowStateRef.current = newWorkflowData;
    onWorkflowUpdate(newWorkflowData);
  }, [onWorkflowUpdate]);

  // Broadcast a local change
  const broadcastChange = useCallback((change: Omit<CollaborativeChange, 'id' | 'userId' | 'userName' | 'timestamp'>) => {
    if (isReadOnly) return;

    const fullChange: CollaborativeChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random()}`,
      userId: 'current_user', // Replace with actual user ID
      userName: 'Current User', // Replace with actual user name
      timestamp: new Date().toISOString()
    };

    changeBufferRef.current.push(fullChange);
    setChanges(prev => [...prev, fullChange]);
    
    broadcastWorkflowChange(change);
  }, [isReadOnly, broadcastWorkflowChange]);

  // Element locking system
  const lockElement = useCallback((elementId: string, userId?: string) => {
    if (!isLockingEnabled) return;
    
    const lockingUserId = userId || 'current_user';
    setLockedElements(prev => new Map(prev).set(elementId, lockingUserId));
    
    toast({
      title: "Element Locked",
      description: `Element is now locked for editing`,
    });
  }, [isLockingEnabled, toast]);

  const unlockElement = useCallback((elementId: string) => {
    setLockedElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(elementId);
      return newMap;
    });
    
    toast({
      title: "Element Unlocked",
      description: `Element is now available for editing`,
    });
  }, [toast]);

  // Conflict resolution
  const resolveConflict = useCallback((changeId: string, resolution: ConflictResolution) => {
    const conflict = conflicts.find(c => c.id === changeId);
    if (!conflict) return;

    switch (resolution.strategy) {
      case 'accept_remote':
        applyChange(conflict);
        break;
      case 'accept_local':
        // Keep local state, mark conflict as resolved
        break;
      case 'merge':
        if (resolution.mergedData) {
          const mergedChange = { ...conflict, data: resolution.mergedData };
          applyChange(mergedChange);
        }
        break;
      case 'manual':
        // User will manually resolve
        return;
    }

    setConflicts(prev => prev.filter(c => c.id !== changeId));
    toast({
      title: "Conflict Resolved",
      description: `Conflict resolved using ${resolution.strategy} strategy`,
    });
  }, [conflicts, applyChange, toast]);

  // Version management
  const saveVersionSnapshot = useCallback((message?: string) => {
    const snapshot: VersionSnapshot = {
      id: `version_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'current_user',
      userName: 'Current User',
      changes: [...changeBufferRef.current],
      workflowState: { ...workflowStateRef.current },
      message
    };

    setVersions(prev => [snapshot, ...prev].slice(0, 50)); // Keep last 50 versions
    changeBufferRef.current = [];
    setLastSaveTime(new Date());

    toast({
      title: "Version Saved",
      description: message || "Workflow version saved successfully",
    });
  }, [toast]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    workflowStateRef.current = version.workflowState;
    onWorkflowUpdate(version.workflowState);

    toast({
      title: "Version Restored",
      description: `Restored to version from ${new Date(version.timestamp).toLocaleString()}`,
    });
  }, [versions, onWorkflowUpdate, toast]);

  // Render collaborator avatars
  const renderCollaborators = () => (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {collaborators.slice(0, 5).map((collaborator) => (
          <Avatar key={collaborator.user_id} className="w-8 h-8 border-2 border-white">
            <AvatarImage src={collaborator.avatar_url} />
            <AvatarFallback>
              {collaborator.user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {collaborators.length > 5 && (
        <Badge variant="secondary">+{collaborators.length - 5}</Badge>
      )}
      <div className="flex items-center gap-1 ml-2">
        {isConnected ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Collaboration Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Real-time Collaboration
              <Badge variant="outline">{collaborators.length} active</Badge>
            </CardTitle>
            {renderCollaborators()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveVersionSnapshot('Manual save')}
              >
                <History className="w-3 h-3 mr-1" />
                Save Version
              </Button>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last saved: {lastSaveTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isLockingEnabled ? "default" : "outline"}
                onClick={() => setIsLockingEnabled(!isLockingEnabled)}
              >
                {isLockingEnabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                Locking
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Panel */}
      {conflicts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Merge Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="p-3 border border-red-200 rounded bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {conflict.type.replace('_', ' ')} by {conflict.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Element: {conflict.elementId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveConflict(conflict.id, { changeId: conflict.id, strategy: 'accept_local' })}
                      >
                        Keep Mine
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveConflict(conflict.id, { changeId: conflict.id, strategy: 'accept_remote' })}
                      >
                        Accept Theirs
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resolveConflict(conflict.id, { changeId: conflict.id, strategy: 'merge' })}
                      >
                        <GitMerge className="w-3 h-3 mr-1" />
                        Merge
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {versions.slice(0, 10).map((version) => (
                <div key={version.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">
                      {version.message || 'Version'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(version.timestamp).toLocaleString()} by {version.userName}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restoreVersion(version.id)}
                  >
                    <GitBranch className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Changes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {changes.slice(0, 5).map((change) => (
              <div key={change.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{change.userName}</span>
                <span className="text-muted-foreground">
                  {change.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(change.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
