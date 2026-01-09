/**
 * Content Violation Warning Dialog
 * Shows progressive warnings for content policy violations
 * Integrates with violation tracker for enforcement
 */

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldX, Lock, Info } from 'lucide-react';

interface ContentViolationWarningProps {
  isOpen: boolean;
  onClose: () => void;
  violationType: string;
  warningLevel: 'warn' | 'restrict' | 'locked';
  message: string;
  remainingWarnings?: number;
  onAcknowledge?: () => void;
}

export function ContentViolationWarning({
  isOpen,
  onClose,
  violationType,
  warningLevel,
  message,
  remainingWarnings,
  onAcknowledge
}: ContentViolationWarningProps) {
  const getIcon = () => {
    switch (warningLevel) {
      case 'locked':
        return <Lock className="h-6 w-6 text-red-600" />;
      case 'restrict':
        return <ShieldX className="h-6 w-6 text-red-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
    }
  };

  const getTitle = () => {
    switch (warningLevel) {
      case 'locked':
        return 'Access Locked';
      case 'restrict':
        return 'Access Restricted';
      default:
        return 'Content Policy Warning';
    }
  };

  const handleAcknowledge = () => {
    onAcknowledge?.();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <AlertDialogTitle className={warningLevel === 'warn' ? 'text-amber-700' : 'text-red-700'}>
              {getTitle()}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p className="text-foreground font-medium">{message}</p>
            
            {violationType && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Violation type:</span>
                <Badge variant="outline" className="text-xs">
                  {violationType}
                </Badge>
              </div>
            )}

            {warningLevel === 'warn' && remainingWarnings !== undefined && (
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                  {remainingWarnings > 0 
                    ? `You have ${remainingWarnings} warning(s) remaining before your access may be restricted.`
                    : 'This is your final warning. Further violations will result in access restriction.'
                  }
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
              <p className="font-medium mb-1">Content Policy Reminder:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Adult, explicit, or NSFW content is strictly prohibited</li>
                <li>Violent, harmful, or dangerous content is not allowed</li>
                <li>All content is monitored for policy compliance</li>
                <li>Violations are logged and may result in account action</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {warningLevel === 'warn' ? (
            <>
              <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAcknowledge}>
                I Understand
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={onClose} className="bg-red-600 hover:bg-red-700">
              Close
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to manage content violation warnings
 */
export function useContentViolationWarning() {
  const [warningState, setWarningState] = useState<{
    isOpen: boolean;
    violationType: string;
    warningLevel: 'warn' | 'restrict' | 'locked';
    message: string;
    remainingWarnings?: number;
  } | null>(null);

  const showWarning = (
    violationType: string,
    warningLevel: 'warn' | 'restrict' | 'locked',
    message: string,
    remainingWarnings?: number
  ) => {
    setWarningState({
      isOpen: true,
      violationType,
      warningLevel,
      message,
      remainingWarnings
    });
  };

  const closeWarning = () => {
    setWarningState(null);
  };

  return {
    warningState,
    showWarning,
    closeWarning,
    WarningDialog: warningState ? (
      <ContentViolationWarning
        isOpen={warningState.isOpen}
        onClose={closeWarning}
        violationType={warningState.violationType}
        warningLevel={warningState.warningLevel}
        message={warningState.message}
        remainingWarnings={warningState.remainingWarnings}
      />
    ) : null
  };
}
