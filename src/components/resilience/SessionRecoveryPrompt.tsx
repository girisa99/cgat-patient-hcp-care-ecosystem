/**
 * Session Recovery Prompt Component - P4-REC-08
 * UI prompt to recover wizard state after crash
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Clock } from 'lucide-react';
import { SessionState } from '@/hooks/useSessionRecovery';

interface SessionRecoveryPromptProps {
  hasRecoverableSession: boolean;
  recoveredState: SessionState | null;
  onRecover: () => void;
  onDismiss: () => void;
}

export const SessionRecoveryPrompt: React.FC<SessionRecoveryPromptProps> = ({
  hasRecoverableSession,
  recoveredState,
  onRecover,
  onDismiss
}) => {
  if (!hasRecoverableSession || !recoveredState) return null;

  const timeAgo = Math.round((Date.now() - new Date(recoveredState.timestamp).getTime()) / 1000 / 60);

  return (
    <Card className="border-warning/50 bg-warning/10">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Resume previous session?</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo} minutes ago • Step {recoveredState.wizardStep + 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <Trash2 className="h-4 w-4 mr-1" />
              Discard
            </Button>
            <Button size="sm" onClick={onRecover}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionRecoveryPrompt;
