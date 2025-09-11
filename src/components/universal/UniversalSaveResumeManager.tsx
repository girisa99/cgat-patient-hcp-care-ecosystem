import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Trash2, Play, Clock, FileText } from 'lucide-react';
import { useUniversalSaveResume } from '@/hooks/useUniversalSaveResume';
import { formatDistanceToNow } from 'date-fns';

interface UniversalSaveResumeManagerProps {
  sessionType: 'patient_enrollment' | 'agent_session' | 'onboarding' | 'npi_verification';
  channelType: 'online' | 'ai_agent' | 'fax' | 'voice' | 'chat' | 'sms';
  currentStep: string;
  formData: Record<string, any>;
  progressPercentage: number;
  onResumeSession?: (sessionData: any) => void;
  onSaveComplete?: () => void;
  onExitAndSave?: () => void;
  metadata?: Record<string, any>;
}

export const UniversalSaveResumeManager: React.FC<UniversalSaveResumeManagerProps> = ({
  sessionType,
  channelType,
  currentStep,
  formData,
  progressPercentage,
  onResumeSession,
  onSaveComplete,
  onExitAndSave,
  metadata
}) => {
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [showSavedSessions, setShowSavedSessions] = useState(false);

  const {
    isSaving,
    sessionData,
    hasExistingSession,
    saveProgress,
    manualSave,
    getSavedSessions,
    deleteSession,
    resumeSession
  } = useUniversalSaveResume(sessionType, channelType);

  // Load saved sessions
  useEffect(() => {
    const loadSessions = async () => {
      const sessions = await getSavedSessions();
      setSavedSessions(sessions);
    };
    loadSessions();
  }, [getSavedSessions]);

  const handleManualSave = async () => {
    await manualSave(currentStep, formData, progressPercentage, metadata);
    if (onSaveComplete) {
      onSaveComplete();
    }
  };

  const handleExitAndSave = async () => {
    await saveProgress(currentStep, formData, progressPercentage, metadata);
    if (onExitAndSave) {
      onExitAndSave();
    }
  };

  const handleResumeSession = async (session: any) => {
    if (onResumeSession) {
      onResumeSession(session);
    }
    setShowSavedSessions(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    const sessions = await getSavedSessions();
    setSavedSessions(sessions);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'online': return <FileText className="h-4 w-4" />;
      case 'ai_agent': return <Play className="h-4 w-4" />;
      case 'fax': return <FileText className="h-4 w-4" />;
      case 'voice': return <Play className="h-4 w-4" />;
      case 'chat': return <FileText className="h-4 w-4" />;
      case 'sms': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'patient_enrollment': return 'Patient Enrollment';
      case 'agent_session': return 'AI Agent Session';
      case 'onboarding': return 'Onboarding';
      case 'npi_verification': return 'NPI Verification';
      default: return type;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Manual Save Button */}
      <Button
        onClick={handleManualSave}
        disabled={isSaving}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Progress'}
      </Button>

      {/* Exit and Save Button */}
      <Button
        onClick={handleExitAndSave}
        disabled={isSaving}
        variant="secondary"
        size="sm"
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Exit & Save
      </Button>

      {/* Saved Sessions Dialog */}
      <Dialog open={showSavedSessions} onOpenChange={setShowSavedSessions}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Continue Previous ({savedSessions.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Continue Previous Sessions</DialogTitle>
            <DialogDescription>
              Choose a previously saved session to continue from where you left off.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {savedSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved sessions found for {getSessionTypeLabel(sessionType)} via {channelType}.
              </div>
            ) : (
              savedSessions.map((session) => (
                <Card key={session.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getChannelIcon(session.channel_type)}
                        {getSessionTypeLabel(session.session_type)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {session.progress_percentage}% Complete
                        </Badge>
                        <Button
                          onClick={() => handleDeleteSession(session.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      Step: {session.current_step} • 
                      Saved {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Channel: {session.channel_type} • 
                        Progress: {session.progress_percentage}%
                      </div>
                      <Button
                        onClick={() => handleResumeSession(session)}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-save indicator */}
      {hasExistingSession && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Auto-saved
        </div>
      )}
    </div>
  );
};