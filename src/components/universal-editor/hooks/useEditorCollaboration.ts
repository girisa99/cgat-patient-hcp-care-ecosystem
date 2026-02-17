/**
 * Editor Collaboration Hook
 * Integrates real-time presence, cursors, and conflict detection for the universal editor
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { UniversalElement } from '../types';
import type { CollaboratorCursor } from '../components/CollaboratorCursors';
import type { Collaborator } from '../components/PresenceIndicators';
import type { Conflict, ConflictVersion, PropertyChange } from '../components/ConflictResolutionDialog';
import { getCollaboratorColor } from '../components/CollaboratorCursors';

// ============================================================================
// TYPES
// ============================================================================

interface EditorCollaborationConfig {
  projectId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userRole: 'owner' | 'editor' | 'viewer' | 'commenter';
  onRemoteElementUpdate?: (elementId: string, data: Record<string, unknown>, userId: string) => void;
  onRemoteElementLock?: (elementId: string, userId: string | null) => void;
}

interface ElementLock {
  elementId: string;
  userId: string;
  userName: string;
  lockedAt: string;
}

interface CursorBroadcast {
  userId: string;
  userName: string;
  avatarUrl?: string;
  position: { x: number; y: number };
  activeElement?: string;
  isTyping?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEditorCollaboration(config: EditorCollaborationConfig) {
  const {
    projectId,
    userId,
    userName,
    userEmail,
    userAvatar,
    userRole,
    onRemoteElementUpdate,
    onRemoteElementLock,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([]);
  const [elementLocks, setElementLocks] = useState<Map<string, ElementLock>>(new Map());
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pendingEditsRef = useRef<Map<string, { version: number; data: Record<string, unknown> }>>(new Map());

  // ============================================================================
  // CHANNEL SETUP
  // ============================================================================

  useEffect(() => {
    if (!projectId || !userId) return;

    const channel = supabase.channel(`editor_${projectId}`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false },
      },
    });

    // Presence handling
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const collabs: Collaborator[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (key === userId) return;
          const presence = (presences as any[])[0];
          if (presence) {
            collabs.push({
              userId: presence.userId,
              userName: presence.userName,
              email: presence.email,
              avatarUrl: presence.avatarUrl,
              role: presence.role || 'viewer',
              status: 'online',
              activeElement: presence.activeElement,
              activeMode: presence.activeMode,
              lastActivity: presence.lastActivity || new Date().toISOString(),
            });
          }
        });

        setCollaborators(collabs);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== userId) {
          const presence = newPresences[0] as any;
          toast.info(`${presence?.userName || 'Someone'} joined`, {
            duration: 2000,
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presence = leftPresences[0] as any;
        // Remove their cursor
        setCursors(prev => prev.filter(c => c.userId !== key));
        // Release their locks
        setElementLocks(prev => {
          const next = new Map(prev);
          prev.forEach((lock, elementId) => {
            if (lock.userId === key) {
              next.delete(elementId);
              onRemoteElementLock?.(elementId, null);
            }
          });
          return next;
        });
        toast.info(`${presence?.userName || 'Someone'} left`, {
          duration: 2000,
        });
      });

    // Cursor broadcasts
    channel.on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      const data = payload as CursorBroadcast;
      if (data.userId === userId) return;

      setCursors(prev => {
        const existing = prev.findIndex(c => c.userId === data.userId);
        const cursor: CollaboratorCursor = {
          userId: data.userId,
          userName: data.userName,
          avatarUrl: data.avatarUrl,
          position: data.position,
          color: getCollaboratorColor(data.userId),
          activeElement: data.activeElement,
          isTyping: data.isTyping,
        };

        if (existing >= 0) {
          const next = [...prev];
          next[existing] = cursor;
          return next;
        }
        return [...prev, cursor];
      });
    });

    // Element lock broadcasts
    channel.on('broadcast', { event: 'element_lock' }, ({ payload }) => {
      const { elementId, lock } = payload as { elementId: string; lock: ElementLock | null };
      if (lock?.userId === userId) return;

      setElementLocks(prev => {
        const next = new Map(prev);
        if (lock) {
          next.set(elementId, lock);
        } else {
          next.delete(elementId);
        }
        return next;
      });
      onRemoteElementLock?.(elementId, lock?.userId ?? null);
    });

    // Element update broadcasts
    channel.on('broadcast', { event: 'element_update' }, ({ payload }) => {
      const { elementId, data, version, senderId } = payload as {
        elementId: string;
        data: Record<string, unknown>;
        version: number;
        senderId: string;
      };
      if (senderId === userId) return;

      // Check for conflicts
      const pending = pendingEditsRef.current.get(elementId);
      if (pending && pending.version <= version) {
        // Conflict detected!
        const conflict = createConflict(elementId, pending.data, data, senderId);
        setActiveConflict(conflict);
      } else {
        onRemoteElementUpdate?.(elementId, data, senderId);
      }
    });

    // Subscribe
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        channelRef.current = channel;

        await channel.track({
          userId,
          userName,
          email: userEmail,
          avatarUrl: userAvatar,
          role: userRole,
          lastActivity: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
      channelRef.current = null;
    };
  }, [projectId, userId, userName, userEmail, userAvatar, userRole, onRemoteElementUpdate, onRemoteElementLock]);

  // ============================================================================
  // CURSOR TRACKING
  // ============================================================================

  const updateCursor = useCallback((position: { x: number; y: number }, activeElement?: string, isTyping?: boolean) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        userId,
        userName,
        avatarUrl: userAvatar,
        position,
        activeElement,
        isTyping,
      },
    });
  }, [userId, userName, userAvatar]);

  // ============================================================================
  // ELEMENT LOCKING
  // ============================================================================

  const lockElement = useCallback((elementId: string): boolean => {
    const existingLock = elementLocks.get(elementId);
    if (existingLock && existingLock.userId !== userId) {
      toast.warning(`Element locked by ${existingLock.userName}`, { duration: 2000 });
      return false;
    }

    const lock: ElementLock = {
      elementId,
      userId,
      userName,
      lockedAt: new Date().toISOString(),
    };

    setElementLocks(prev => new Map(prev).set(elementId, lock));
    channelRef.current?.send({
      type: 'broadcast',
      event: 'element_lock',
      payload: { elementId, lock },
    });

    return true;
  }, [elementLocks, userId, userName]);

  const unlockElement = useCallback((elementId: string) => {
    setElementLocks(prev => {
      const next = new Map(prev);
      next.delete(elementId);
      return next;
    });
    channelRef.current?.send({
      type: 'broadcast',
      event: 'element_lock',
      payload: { elementId, lock: null },
    });
  }, []);

  const isElementLocked = useCallback((elementId: string): boolean => {
    const lock = elementLocks.get(elementId);
    return !!lock && lock.userId !== userId;
  }, [elementLocks, userId]);

  const getElementLockOwner = useCallback((elementId: string): string | null => {
    return elementLocks.get(elementId)?.userName ?? null;
  }, [elementLocks]);

  // ============================================================================
  // ELEMENT UPDATES
  // ============================================================================

  const broadcastElementUpdate = useCallback((elementId: string, data: Record<string, unknown>, version: number) => {
    pendingEditsRef.current.set(elementId, { version, data });
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'element_update',
      payload: { elementId, data, version, senderId: userId },
    });

    // Clear pending after a delay
    setTimeout(() => {
      pendingEditsRef.current.delete(elementId);
    }, 5000);
  }, [userId]);

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  const resolveConflict = useCallback((resolution: 'local' | 'remote' | 'merge', mergedData?: Record<string, unknown>) => {
    if (!activeConflict) return;

    if (resolution === 'local' || resolution === 'merge') {
      const data = mergedData || activeConflict.localVersion.data;
      onRemoteElementUpdate?.(activeConflict.elementId, data, userId);
      broadcastElementUpdate(activeConflict.elementId, data, Date.now());
    } else {
      onRemoteElementUpdate?.(activeConflict.elementId, activeConflict.remoteVersion.data, activeConflict.remoteVersion.userId);
    }

    setActiveConflict(null);
    toast.success('Conflict resolved');
  }, [activeConflict, userId, onRemoteElementUpdate, broadcastElementUpdate]);

  const dismissConflict = useCallback(() => {
    setActiveConflict(null);
  }, []);

  // ============================================================================
  // PRESENCE UPDATE
  // ============================================================================

  const updatePresence = useCallback((data: { activeElement?: string; activeMode?: string }) => {
    channelRef.current?.track({
      userId,
      userName,
      email: userEmail,
      avatarUrl: userAvatar,
      role: userRole,
      lastActivity: new Date().toISOString(),
      ...data,
    });
  }, [userId, userName, userEmail, userAvatar, userRole]);

  return {
    isConnected,
    collaborators,
    cursors,
    elementLocks,
    activeConflict,
    updateCursor,
    lockElement,
    unlockElement,
    isElementLocked,
    getElementLockOwner,
    broadcastElementUpdate,
    resolveConflict,
    dismissConflict,
    updatePresence,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function createConflict(
  elementId: string,
  localData: Record<string, unknown>,
  remoteData: Record<string, unknown>,
  remoteUserId: string
): Conflict {
  const localChanges = diffObjects(localData, remoteData, 'local');
  const remoteChanges = diffObjects(remoteData, localData, 'remote');

  return {
    id: `conflict_${elementId}_${Date.now()}`,
    elementId,
    elementName: `Element ${elementId.slice(0, 8)}`,
    elementType: (localData.type as string) || 'unknown',
    localVersion: {
      userId: 'current-user',
      userName: 'You',
      timestamp: new Date().toISOString(),
      data: localData,
      changes: localChanges,
    },
    remoteVersion: {
      userId: remoteUserId,
      userName: `User ${remoteUserId.slice(0, 6)}`,
      timestamp: new Date().toISOString(),
      data: remoteData,
      changes: remoteChanges,
    },
  };
}

function diffObjects(source: Record<string, unknown>, target: Record<string, unknown>, label: string): PropertyChange[] {
  const changes: PropertyChange[] = [];
  
  Object.keys(source).forEach(key => {
    if (JSON.stringify(source[key]) !== JSON.stringify(target[key])) {
      changes.push({
        property: key,
        oldValue: target[key],
        newValue: source[key],
        displayName: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      });
    }
  });

  return changes;
}
