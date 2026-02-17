/**
 * Session Recovery Prompt Component - P4-REC-08
 * UI prompt to recover wizard state after crash
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Clock } from 'lucide-react';
import { useSessionRecovery, SessionState } from '@/hooks/useSessionRecovery';
import { motion, AnimatePresence } from 'framer-motion';

export interface SessionRecoveryPromptProps {
  /** For controlled mode - provide all props */
  hasRecoverableSession?: boolean;
  recoveredState?: SessionState | null;
  onRecover?: () => void;
  onDismiss?: () => void;
  /** For self-contained mode - just provide sessionKey */
  sessionKey?: string;
}

/**
 * Controlled version - for embedding in specific pages with external state
 */
export const SessionRecoveryPromptControlled: React.FC<{
  hasRecoverableSession: boolean;
  recoveredState: SessionState | null;
  onRecover: () => void;
  onDismiss: () => void;
}> = ({
  hasRecoverableSession,
  recoveredState,
  onRecover,
  onDismiss
}) => {
  if (!hasRecoverableSession || !recoveredState) return null;

  const timeAgo = Math.round((Date.now() - new Date(recoveredState.timestamp).getTime()) / 1000 / 60);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary" />
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

/**
 * Self-contained version with internal hook - for global App.tsx usage
 * Automatically shows a floating prompt when recoverable session exists
 */
export const SessionRecoveryPrompt: React.FC<SessionRecoveryPromptProps> = (props) => {
  const sessionKey = props.sessionKey || 'global_wizard';
  const [dismissed, setDismissed] = useState(false);
  
  // Use hook with proper options
  const { 
    hasRecoverableSession: hookHasSession, 
    recoveredState: hookRecoveredState, 
    dismissRecovery,
    recoverSession 
  } = useSessionRecovery({ sessionKey });

  // Determine whether to use props or hook values
  const hasRecoverableSession = props.hasRecoverableSession ?? hookHasSession;
  const recoveredState = props.recoveredState ?? hookRecoveredState;

  // Early return after hooks
  if (!hasRecoverableSession || !recoveredState || dismissed) return null;

  const timeAgo = Math.round((Date.now() - new Date(recoveredState.timestamp).getTime()) / 1000 / 60);

  const handleDismiss = () => {
    if (props.onDismiss) {
      props.onDismiss();
    } else {
      dismissRecovery();
    }
    setDismissed(true);
  };

  const handleRecover = () => {
    if (props.onRecover) {
      props.onRecover();
    } else {
      recoverSession();
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 right-4 z-50 max-w-md"
      >
        <Card className="border-primary/30 bg-background shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Resume previous session?</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}m ago • Step {recoveredState.wizardStep + 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleRecover}>
                  Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionRecoveryPrompt;
