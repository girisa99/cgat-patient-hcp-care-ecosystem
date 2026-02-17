/**
 * Enrollment Resume Widget
 * Shows saved enrollment sessions and allows users to resume where they left off
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  User, 
  MessageSquare, 
  Database, 
  Settings,
  ChevronRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useUniversalSaveResume } from '@/hooks/useUniversalSaveResume.tsx';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface EnrollmentResumeWidgetProps {
  onResumeSession?: (sessionData: any, agentType: string) => void;
}

interface SavedSession {
  id?: string;
  session_type: string;
  current_step: string;
  form_data: Record<string, any>;
  progress_percentage: number;
  channel_type: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const EnrollmentResumeWidget: React.FC<EnrollmentResumeWidgetProps> = ({
  onResumeSession
}) => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const patientEnrollmentSave = useUniversalSaveResume('patient_enrollment', 'ai_agent');
  const { toast } = useToast();

  const loadSavedSessions = async () => {
    setIsLoading(true);
    try {
      const sessions = await patientEnrollmentSave.getSavedSessions();
      setSavedSessions(sessions);
    } catch (error) {
      console.error('Failed to load saved sessions:', error);
      toast({
        title: "Error Loading Sessions",
        description: "Failed to load your saved enrollment sessions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedSessions();
  }, []);

  const getAgentIcon = (channelType: string, agentType?: string) => {
    if (agentType === 'mcp_stepwise') return <Database className="h-4 w-4" />;
    if (agentType === 'conversational') return <MessageSquare className="h-4 w-4" />;
    if (agentType === 'structured') return <Settings className="h-4 w-4" />;
    
    // Fallback based on channel type
    switch (channelType) {
      case 'ai_agent':
        return <MessageSquare className="h-4 w-4" />;
      case 'online':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getAgentName = (metadata?: Record<string, any>) => {
    if (metadata?.agent_type === 'mcp_stepwise') return 'MCP Stepwise';
    if (metadata?.agent_type === 'conversational') return 'Conversational AI';
    if (metadata?.agent_type === 'structured') return 'Structured AI';
    return 'Standard Form';
  };

  const formatStepName = (step: string) => {
    return step
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleResumeSession = (session: SavedSession) => {
    const agentType = session.metadata?.agent_type || 'standard';
    onResumeSession?.(session, agentType);
    
    toast({
      title: "Session Resumed",
      description: `Continuing enrollment from ${formatStepName(session.current_step)}`,
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await patientEnrollmentSave.deleteSession(sessionId);
      setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session Deleted",
        description: "Saved enrollment session has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading saved sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resume Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved enrollment sessions found</p>
            <p className="text-sm mt-2">Start a new enrollment to save your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resume Enrollment
            <Badge variant="secondary">{savedSessions.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadSavedSessions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Continue where you left off with any enrollment agent
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedSessions.map((session) => (
            <Card key={session.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getAgentIcon(session.channel_type, session.metadata?.agent_type)}
                    <span className="font-medium">{getAgentName(session.metadata)}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.metadata?.module_type || 'Patient'} Enrollment
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        Current Step: {formatStepName(session.current_step)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className={`text-right ${getProgressColor(session.progress_percentage)}`}>
                      <div className="text-lg font-bold">{session.progress_percentage}%</div>
                      <div className="text-xs">Complete</div>
                    </div>
                  </div>

                  <Progress value={session.progress_percentage} className="h-2" />

                  {/* Form Data Preview */}
                  {session.form_data && Object.keys(session.form_data).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Collected Information:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(session.form_data)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                              <span className="font-mono">
                                {typeof value === 'string' ? value.substring(0, 20) + (value.length > 20 ? '...' : '') : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                      {Object.keys(session.form_data).length > 4 && (
                        <div className="mt-1 text-muted-foreground">
                          +{Object.keys(session.form_data).length - 4} more fields
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={() => handleResumeSession(session)}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue Enrollment
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};