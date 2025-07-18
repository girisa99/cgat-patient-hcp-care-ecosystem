import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, LogOut, RotateCcw, Edit } from 'lucide-react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { AgentSession } from '@/types/agent-session';
import { toast } from '@/hooks/use-toast';

interface SessionControlsProps {
  session: AgentSession | null;
  onSave: () => void;
  onExit: () => void;
  onContinue?: () => void;
  isSaving?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  onSave,
  onExit,
  onContinue,
  isSaving = false,
}) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
      {session && (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{session.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Current step: {session.current_step.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last saved: {new Date(session.updated_at).toLocaleString()}
          </p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {onContinue && (
          <Button
            variant="outline"
            size="sm"
            onClick={onContinue}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Continue Previous
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit
        </Button>
      </div>
    </div>
  );
};

interface SessionListProps {
  sessions: AgentSession[];
  onSelectSession: (session: AgentSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No saved sessions found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Previous Sessions</CardTitle>
        <CardDescription>Pick up where you left off</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelectSession(session)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{session.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {session.current_step.replace('_', ' ')}
                  </Badge>
                  <Badge 
                    variant={session.status === 'deployed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {session.status}
                  </Badge>
                </div>
                {session.description && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {session.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(session.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSession(session);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};