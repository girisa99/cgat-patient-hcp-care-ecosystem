/**
 * GENIE SESSION MANAGER
 * Advanced session management with snapshots, recovery, search and analytics
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  History,
  Search,
  Download,
  Upload,
  Archive,
  RotateCcw,
  MessageSquare,
  Clock,
  Calendar,
  Filter,
  BarChart3,
  Trash2,
  Star,
  Play,
  Pause,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenieState, GenieConversationSession } from '@/hooks/useGenieState';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface GenieSessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect: (session: GenieConversationSession) => void;
  currentSessionId?: string;
}

export const GenieSessionManager: React.FC<GenieSessionManagerProps> = ({
  isOpen,
  onClose,
  onSessionSelect,
  currentSessionId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'messages'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'archived'>('all');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const { 
    sessions, 
    currentSession,
    loading, 
    loadSessions, 
    saveSession, 
    updateSession,
    createNewSession 
  } = useGenieState({ autoLoad: false });
  
  const { showSuccess, showError } = useMasterToast();
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();

  // Load sessions only when the manager is opened
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.session_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.messages.some(msg => 
                             msg.content.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'active' && session.is_active) ||
                           (filterBy === 'archived' && !session.is_active);
      
      return matchesSearch && matchesFilter;
    });

    // Sort sessions
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at || b.created_at || 0).getTime() - 
                 new Date(a.updated_at || a.created_at || 0).getTime();
        case 'name':
          return a.session_name.localeCompare(b.session_name);
        case 'messages':
          return b.messages.length - a.messages.length;
        default:
          return 0;
      }
    });
  }, [sessions, searchTerm, sortBy, filterBy]);

  // Session analytics
  const sessionAnalytics = useMemo(() => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.is_active).length;
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    const avgMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;
    
    // Recent activity (last 7 days)
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.updated_at || s.created_at || 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate > weekAgo;
    });

    return {
      totalSessions,
      activeSessions,
      totalMessages,
      avgMessagesPerSession,
      recentActivity: recentSessions.length
    };
  }, [sessions]);

  const formatSessionDate = useCallback((dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  }, []);

  const getSessionPreview = useCallback((session: GenieConversationSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'No messages';
    
    const preview = lastMessage.content.length > 100 
      ? lastMessage.content.substring(0, 100) + '...'
      : lastMessage.content;
    
    return preview;
  }, []);

  const handleSessionSelect = useCallback((session: GenieConversationSession) => {
    onSessionSelect(session);
    onClose();
  }, [onSessionSelect, onClose]);

  const handleCreateSnapshot = useCallback(async (session: GenieConversationSession) => {
    const snapshotName = `${session.session_name} - Snapshot ${format(new Date(), 'MMM d, HH:mm')}`;
    
    const snapshot: Omit<GenieConversationSession, 'id'> = {
      conversation_id: `${session.conversation_id}_snapshot_${Date.now()}`,
      session_name: snapshotName,
      messages: [...session.messages],
      configuration_snapshot: { ...session.configuration_snapshot },
      is_active: false
    };

    const saved = await saveSession(snapshot);
    if (saved) {
      showSuccess('Session snapshot created');
      loadSessions();
    }
  }, [saveSession, showSuccess, loadSessions]);

  const handleArchiveSession = useCallback(async (session: GenieConversationSession) => {
    const updated = await updateSession(session.conversation_id, { is_active: false });
    if (updated) {
      showSuccess(`Session "${session.session_name}" archived`);
    }
  }, [updateSession, showSuccess]);

  const handleRestoreSession = useCallback(async (session: GenieConversationSession) => {
    const updated = await updateSession(session.conversation_id, { is_active: true });
    if (updated) {
      showSuccess(`Session "${session.session_name}" restored`);
    }
  }, [updateSession, showSuccess]);

  const handleBulkAction = useCallback(async (action: 'archive' | 'restore' | 'delete') => {
    if (selectedSessions.length === 0) return;

    for (const sessionId of selectedSessions) {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) continue;

      switch (action) {
        case 'archive':
          await updateSession(session.conversation_id, { is_active: false });
          break;
        case 'restore':
          await updateSession(session.conversation_id, { is_active: true });
          break;
        case 'delete':
          // Note: Delete functionality would need to be implemented in useGenieState
          console.log('Delete not implemented yet');
          break;
      }
    }

    setSelectedSessions([]);
    showSuccess(`Bulk ${action} completed`);
    loadSessions();
  }, [selectedSessions, sessions, updateSession, showSuccess, loadSessions]);

  const exportSessions = useCallback(() => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `genie-sessions-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Sessions exported');
  }, [sessions, showSuccess]);

  if (!isOpen) return null;

  // Show auth prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              Authentication Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <p className="text-muted-foreground">
              Please log in to access session management features.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/login'} 
                className="flex-1"
              >
                Go to Login
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            GENIE Session Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions or messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="messages">Most Messages</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportSessions}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {selectedSessions.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('archive')}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive ({selectedSessions.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('restore')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore ({selectedSessions.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Panel */}
            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b bg-muted/20"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-5 gap-4">
                      <Card className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{sessionAnalytics.totalSessions}</p>
                          <p className="text-xs text-muted-foreground">Total Sessions</p>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{sessionAnalytics.activeSessions}</p>
                          <p className="text-xs text-muted-foreground">Active Sessions</p>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{sessionAnalytics.totalMessages}</p>
                          <p className="text-xs text-muted-foreground">Total Messages</p>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{sessionAnalytics.avgMessagesPerSession}</p>
                          <p className="text-xs text-muted-foreground">Avg Messages</p>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{sessionAnalytics.recentActivity}</p>
                          <p className="text-xs text-muted-foreground">Last 7 Days</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading sessions...</div>
                </div>
              ) : filteredAndSortedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p>No sessions found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedSessions.map((session) => (
                    <Card
                      key={session.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentSessionId === session.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.id!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSessions(prev => [...prev, session.id!]);
                              } else {
                                setSelectedSessions(prev => prev.filter(id => id !== session.id));
                              }
                            }}
                            className="mt-1"
                          />

                          {/* Session Info */}
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => handleSessionSelect(session)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium truncate">{session.session_name}</h4>
                              <div className="flex gap-1">
                                {session.is_active ? (
                                  <Badge variant="default" className="text-xs">
                                    <Play className="h-2 w-2 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    <Pause className="h-2 w-2 mr-1" />
                                    Archived
                                  </Badge>
                                )}
                                {currentSessionId === session.id && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="h-2 w-2 mr-1" />
                                    Current
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {getSessionPreview(session)}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {session.messages.length} messages
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatSessionDate(session.updated_at || session.created_at)}
                              </span>
                              {session.updated_at && (
                                <span>
                                  {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateSnapshot(session);
                              }}
                              title="Create Snapshot"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            {session.is_active ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveSession(session);
                                }}
                                title="Archive Session"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreSession(session);
                                }}
                                title="Restore Session"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};