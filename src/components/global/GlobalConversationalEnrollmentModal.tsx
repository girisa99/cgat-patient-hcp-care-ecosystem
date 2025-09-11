/**
 * GLOBAL CONVERSATIONAL ENROLLMENT MODAL
 * Modal wrapper for conversational enrollment that can be triggered from anywhere
 */
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { ConversationalEnrollmentSelector } from '../universal-enrollment/ConversationalEnrollmentSelector';

export const GlobalConversationalEnrollmentModal: React.FC = () => {
  const { isOpen, moduleType, closeEnrollment, onComplete } = useGlobalConversationalEnrollment();

  console.log('🎭 Modal render - isOpen:', isOpen, 'moduleType:', moduleType);

  if (!moduleType) {
    console.log('❌ No moduleType, not rendering modal');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeEnrollment()}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto p-0">
        <div className="h-full overflow-y-auto">
          <ConversationalEnrollmentSelector
            moduleType={moduleType}
            onComplete={onComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};